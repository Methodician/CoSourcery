import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'suggestionSort',
  pure: false
})
export class SuggestionSortPipe implements PipeTransform {

  transform(suggestions: any[], sortType?: SortOptions): any {
    if (!suggestions) {
      return null;
    }
    switch (sortType) {
      case SortOptions.upvotes:
        return suggestions.sort((a, b) => {
          return b.voteCount - a.voteCount;
        });
      case SortOptions.newest:
        return suggestions.sort((a, b) => {
          if (a.timestamp > b.timestamp) {return -1; }
          if (a.timestamp < b.timestamp) {return 1; }
          return 0;
        });
      case SortOptions.oldest:
        return suggestions.sort((a, b) => {
          if (a.timestamp < b.timestamp) {return -1; }
          if (a.timestamp > b.timestamp) {return 1; }
          return 0;
        });
      default:
        return suggestions;
    }
  }
}

export enum SortOptions {
  'upvotes' = 1,
  'newest',
  'oldest'
}
