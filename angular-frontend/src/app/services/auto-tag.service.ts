import {Injectable} from "@angular/core";
import {TaggedElem, TagGuessElem} from "../models/tags.model";
import {get as levenshtein} from 'fast-levenshtein';
import {TagService} from "./tag.service";
import {take} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AutoTagService {

  private readonly MATCH_THRESHOLD = 2;
  private readonly BLACKLIST = [
    'min',
    'dms'
  ]

  constructor(private readonly tagService: TagService) {}

  public async guessTags<T>(elems: Array<TagGuessElem<T>>): Promise<Array<TaggedElem<T>>> {
    const knownTags = await this.tagService.tags$.pipe(
      take(1)
    ).toPromise();
    return elems.map(f => this.guessTagsForFile(f, knownTags.map(t => t.name)));
  }

  private guessTagsForFile<T>(elem: TagGuessElem<T>, knownTags: Array<string>): TaggedElem<T> {
    // remove file ending
    const fileName = elem.name.replace(/\.[a-zA-Z]+$/, '');
    // split on typical split characters in filenames
    const fileNameChunks = fileName.split(/(\s+|\s*\.+\s*|\s*-+\s*|\s*_+\s*)/g);
    // split resulting chunks into camelcase if applicable
    const decamelizedChunks = fileNameChunks.map(chunk => this.splitCamelCase(chunk)).reduce((accu, curr) => {
      accu.push(...curr);
      return accu;
    }, []);

    const potentialTags = decamelizedChunks
      .map(c => this.couldBeTag(c))
      .filter((c: string | undefined): c is string => c !== undefined);
    const tags = this.mapPotentialTagsToTags(potentialTags, knownTags);
    return {
      payload: elem.payload,
      tags
    };
  }

  private couldBeTag(val: string): string | undefined {
    const baseVal = val.trim().toLowerCase();
    if (baseVal.length === 1) {
      if (baseVal === 'f')
        return 'female';
      if (baseVal === 'm')
        return 'male';
      if (baseVal === 'd')
        return 'diverse';
      return undefined;
    }
    const stripped = baseVal.replace(/[^a-zA-Z]/g, '');
    if (stripped.length >= 3 && !this.BLACKLIST.includes(stripped)) {
      return stripped;
    }
    return undefined;
  }

  private mapPotentialTagsToTags(potentialTags: string[], knownTags: Array<string>): Array<string> {
    return potentialTags.map(potentialTag => {
      const fittingTag = knownTags.map(t => {
        const distance = levenshtein(t.toLowerCase(), potentialTag.toLowerCase());
        if (distance < this.MATCH_THRESHOLD) {
          return {
            tag: t,
            distance
          };
        } else {
          return undefined;
        }
      }).filter((v): v is {tag: string, distance: number} => v !== undefined)
        .sort((a, b) => a.distance - b?.distance)[0];
      return (fittingTag?.tag ?? potentialTag).toLowerCase();
    });
  }

  private splitCamelCase(camelCaseWord: string): Array<string> {
    const upperCamelCase = camelCaseWord.substr(0, 1).toUpperCase() + camelCaseWord.substring(1);
    return upperCamelCase.split(/(?=[A-Z])/).map(word => word.toLowerCase());
  }
}
