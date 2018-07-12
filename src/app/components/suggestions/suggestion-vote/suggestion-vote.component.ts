import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { Router } from '@angular/router';
import { VoteService } from '../../../services/vote.service';
import { Vote } from '../../../shared/class/vote';
@Component({
  selector: 'cos-suggestion-vote',
  templateUrl: './suggestion-vote.component.html',
  styleUrls: ['./suggestion-vote.component.scss']
})
export class SuggestionVoteComponent implements OnInit, OnChanges {
  @Input() suggestion;
  @Input() currentUserKey;
  voteState = 0;
  voteTotal = 0;

  constructor(private voteSvc: VoteService, private router: Router) { }

  ngOnInit() {
    // if (this.currentUserKey) {
    //   this.voteSvc
    //     .getVoteState(this.suggestion.id, this.currentUserKey)
    //     .valueChanges()
    //     .subscribe(voteState => {
    //       this.voteState = (voteState) ? voteState as number : 0;
    //     });
    // }

    // not sure this works yet.
    if (this.currentUserKey) {
      this.voteSvc
        .getVoteState(this.suggestion.id, this.currentUserKey).then(result => {
          this.voteState = (result) ? result as number : 0;
        });
    }
  }

  ngOnChanges(changes) {
    if (changes.suggestion) { this.voteTotal = changes.suggestion.currentValue.voteCount; }
  }

  // TODO: This should let a user know they're not logged in and give them an option to redirect.
  // Maybe should just use the isLoggedIn method to keep things standardized.
  attemptVote(voteNum) {
    if (this.currentUserKey) {
      this.vote(voteNum);
    } else { this.router.navigate(['login']); }
  }

  // sets the current state of a user's vote
  vote(voteNum: number) {
    // resets the component's vote state to 0 if the current vote state is equal to the vote that was just clicked
    this.voteTotal += this.getTotalVoteChange(voteNum);
    this.voteState = (this.voteState === voteNum) ? 0 : voteNum;
    const vote = new Vote(this.currentUserKey, this.suggestion.id, this.voteState, this.voteTotal);
    this.voteSvc.saveVote(vote);
  }

  getTotalVoteChange(voteNum) {
    switch (Math.abs(voteNum + this.voteState)) {
      case 0: return voteNum * 2;
      case 1: return voteNum;
      case 2: return this.voteState * -1;
    }
  }

  // returns boolean, true if given voteState equals current component voteState
  isActiveState(voteState) {
    return voteState === this.voteState;
  }
}
