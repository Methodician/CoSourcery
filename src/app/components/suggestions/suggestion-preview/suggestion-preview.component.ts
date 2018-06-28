import { Component, OnInit, Input } from '@angular/core';
import { SuggestionService } from '../../../services/suggestion.service';

@Component({
  selector: 'cos-suggestion-preview',
  templateUrl: './suggestion-preview.component.html',
  styleUrls: ['./suggestion-preview.component.scss']
})
export class SuggestionPreviewComponent implements OnInit {

  constructor(private service: SuggestionService) { }
  @Input() suggestion;
  @Input() currentUserKey;

  ngOnInit() {
  }

}
