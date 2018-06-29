import { Suggestion } from '../../../shared/class/suggestion';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SuggestionService } from '../../../services/suggestion.service';

@Component({
  selector: 'cos-suggestion-edit',
  templateUrl: './suggestion-edit.component.html',
  styleUrls: ['./suggestion-edit.component.scss']
})
export class SuggestionEditComponent implements OnInit {
  suggestion: Suggestion;
  constructor(private route: ActivatedRoute, private suggestionSvc: SuggestionService, ) { }

  ngOnInit() {
    const key = this.route.snapshot.params['key'];
    this.suggestionSvc
      .getSuggestionById(key)
      .then(suggestion => {
        this.suggestion = suggestion;
      });
  }


  saveSuggestion(suggestionData) {
    this.suggestionSvc.updateSuggestion(this.suggestion.id, suggestionData);
  }
}
