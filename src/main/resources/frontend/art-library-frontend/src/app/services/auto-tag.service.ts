import {Injectable} from "@angular/core";
import {TaggedElem, TagGuessElem} from "../models/tags.model";
import {get as levenshtein} from 'fast-levenshtein';

@Injectable({
  providedIn: 'root'
})
export class AutoTagService {

  private readonly MATCH_THRESHOLD = 3;
  private readonly BLACKLIST = [
    'min',
    'dms'
  ]

  public guessTags<T>(elems: Array<TagGuessElem<T>>, knownTags: Array<string>): Array<TaggedElem<T>> {
    return elems.map(f => this.guessTagsForFile(f, knownTags));
  }

  private guessTagsForFile<T>(elem: TagGuessElem<T>, knownTags: Array<string>): TaggedElem<T> {
    const fileName = elem.name.replace(/\.[a-zA-Z]+$/, '');
    const fileNameChunks = fileName.split(/(\s+|\s*\.+\s*|\s*-+\s*|\s*_+\s*)/g);
    const potentialTags = fileNameChunks
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
      const fittingTag = knownTags.find(t => levenshtein(t.toLowerCase(), potentialTag.toLowerCase()) < this.MATCH_THRESHOLD);
      return (fittingTag ?? potentialTag).toLowerCase();
    });
  }
}
