import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';

import { version } from '../../package.json';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  subscription: Subscription;

  title = 'codeclicker';
  public version: string = version;
  source = interval(1000);

  linesOfCode = 0;
  addLinesOfCode = 1;
  log = [];
  adjectives = [
    'beautiful',
    'nice',
    'terrific',
    'bad'
  ];
  unlock = {
    buyMoreLinesOfCodePerClick: false
  };

  cost = {
    buyMoreLinesOfCodePerClick: {
      1: 10,
      2: 100,
      3: 250,
      4: 500,
      5: 1000
    }
  };

  nextCost = {
    buyMoreLinesOfCodePerClick: 10
  }

  public writeLineOfCode(): void {
    this.linesOfCode += this.addLinesOfCode;
    const randomAdjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const sentence = '> You wrote ' + this.addLinesOfCode + ' line' + (this.addLinesOfCode > 1 ? 's' : '') + ' of ' + randomAdjective + ' code.';
    this.log.push(sentence);
    document.querySelector('#log li:last-child').scrollIntoView();
    localStorage.setItem('linesOfCode', this.linesOfCode.toString());
  }
  public buyMoreLinesOfCodePerClick(): void {
    if (this.linesOfCode >= this.cost.buyMoreLinesOfCodePerClick[this.addLinesOfCode]) {
      this.linesOfCode -= this.cost.buyMoreLinesOfCodePerClick[this.addLinesOfCode];
      this.nextCost.buyMoreLinesOfCodePerClick = this.cost.buyMoreLinesOfCodePerClick[this.addLinesOfCode + 1]
      this.addLinesOfCode++;
      localStorage.setItem('addLinesOfCode', this.addLinesOfCode.toString());
    }
    // TODO: calculcate cost
  }

  ngOnInit() {
    this.linesOfCode = parseInt(localStorage.getItem('linesOfCode'), 10) || 0;
    this.addLinesOfCode = parseInt(localStorage.getItem('addLinesOfCode'), 10) || 1;
    this.nextCost.buyMoreLinesOfCodePerClick = this.cost.buyMoreLinesOfCodePerClick[this.addLinesOfCode];
    const sentence = '> Loaded ' + this.linesOfCode + ' line' + (this.linesOfCode > 1 ? 's' : '') + ' of code.';
    this.log.push(sentence);
    this.subscription = this.source.subscribe(val => {
      if (!this.unlock.buyMoreLinesOfCodePerClick && this.linesOfCode >= 10) {
        this.unlock.buyMoreLinesOfCodePerClick = true;
      }

      // TODO: here is the cycle

    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
