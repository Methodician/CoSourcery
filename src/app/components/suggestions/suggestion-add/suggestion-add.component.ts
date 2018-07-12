import { Component } from '@angular/core';
import { SuggestionService } from '../../../services/suggestion.service';

@Component({
  selector: 'cos-suggestion-add',
  templateUrl: './suggestion-add.component.html',
  styleUrls: ['./suggestion-add.component.scss']
})
export class SuggestionAddComponent  {

  constructor(private suggestionSvc: SuggestionService) { }

  saveSuggestion(formData) {
    this.suggestionSvc.saveSuggestion(formData);
  }

}
