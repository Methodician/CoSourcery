import { Component, OnInit } from '@angular/core';
import { SuggestionService } from '../../../services/suggestion.service';
import { Suggestion } from '../../../shared/class/suggestion';
import { SortOptions } from 'app/shared/pipes/suggestion-sort.pipe';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'cos-suggestions',
  templateUrl: './suggestions.component.html',
  styleUrls: ['./suggestions.component.scss']
})
export class SuggestionsComponent implements OnInit {
suggestions:any[];
currentUserKey: string;
currentSortOption: SortOptions = SortOptions.upvotes;
  constructor(private suggestionSvc: SuggestionService, private authSvc: AuthService) { }

  ngOnInit() {
    window.scrollTo(0, 0);

    this.authSvc.authInfo.subscribe(authInfo => {
      this.currentUserKey = (authInfo.uid) ? authInfo.uid : null;
    });

    this.suggestionSvc.getAllSuggestions().then((suggestions: Suggestion[]) =>{
      console.log('suggestions', suggestions)
      this.suggestions = suggestions;
    });
  }

  isSelected(sortOption: string) {
    return SortOptions[sortOption] === this.currentSortOption;
  }

  sortBy(sortOption: string) {
    this.currentSortOption = SortOptions[sortOption];
  }


}
