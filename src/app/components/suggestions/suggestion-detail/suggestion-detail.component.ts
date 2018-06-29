import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SuggestionService } from '../../../services/suggestion.service';

@Component({
  selector: 'cos-suggestion-detail',
  templateUrl: './suggestion-detail.component.html',
  styleUrls: ['./suggestion-detail.component.scss']
})
export class SuggestionDetailComponent implements OnInit {
  suggestion;
  constructor(private route: ActivatedRoute, private suggestionSvc: SuggestionService) { }

  ngOnInit() {
    const key = this.route.snapshot.params['key'];
    this.suggestionSvc
      .getSuggestionById(key)
      .then(object => {
        this.suggestion = object;
      });
  }
}
