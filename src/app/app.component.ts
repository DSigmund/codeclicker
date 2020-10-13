import { ThrowStmt } from '@angular/compiler';
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
  autoClicker = 0;
  log = [];
  adjectives = [
    'beautiful',
    'nice',
    'terrific',
    'bad'
  ];
  unlocks = [
    'buyMoreLinesOfCodePerClick',
    'buyAutoClicker'
  ];
  unlockAt = {
    buyMoreLinesOfCodePerClick: 10,
    buyAutoClicker: 100
  };

  unlock = {
    buyMoreLinesOfCodePerClick: false,
    buyAutoClicker: false
  };

  cost = {
    buyMoreLinesOfCodePerClick: {
      1: 10,
      2: 100,
      3: 250,
      4: 500,
      5: 1000
    },
    buyAutoClicker: {
      1: 100,
      2: 1000,
      3: 2500,
      4: 5000,
      5: 10000
    }
  };

  nextCost = {
    buyMoreLinesOfCodePerClick: 10,
    buyAutoClicker: 100
  };

  public writeLineOfCode(): void {
    this.linesOfCode += this.addLinesOfCode;
    const randomAdjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const sentence = '> You wrote ' + this.addLinesOfCode + ' line' + (this.addLinesOfCode > 1 ? 's' : '') + ' of ' + randomAdjective + ' code.';
    this.log.push(sentence);
    document.querySelector('#log li:last-child').scrollIntoView();
    localStorage.setItem('linesOfCode', this.linesOfCode.toString());
  }
  public buy(what: string, obj): void {
    let cost;
    let nextCost;
    if (this[obj] === 0) { // objects that start with zero (addlines starts with 1)
      cost = this.cost[what][this[obj] + 1];
      nextCost = this.cost[what][this[obj] + 2];
    } else {
      cost = this.cost[what][this[obj]];
      nextCost = this.cost[what][this[obj] + 1];
    }
    if (this.linesOfCode >= cost) {
      this.linesOfCode -= cost;
      this.nextCost[what] = nextCost;
      this[obj]++;
      localStorage.setItem(obj, this[obj].toString());
    }
  }

  public reset(): void {
    this.autoClicker = 0;
    this.addLinesOfCode = 1;
    this.linesOfCode = 0;
    this.unlock = {
      buyMoreLinesOfCodePerClick: false,
      buyAutoClicker: false
    };
    this.log = [];
    localStorage.clear();
  }

  ngOnInit() {
    this.linesOfCode = parseInt(localStorage.getItem('linesOfCode'), 10) || 0;
    this.addLinesOfCode = parseInt(localStorage.getItem('addLinesOfCode'), 10) || 1;
    this.autoClicker = parseInt(localStorage.getItem('autoClicker'), 10) || 0;

    if (localStorage.getItem('unlock')) {
      this.unlock = JSON.parse(localStorage.getItem('unlock'));
    }

    this.nextCost.buyMoreLinesOfCodePerClick = this.cost.buyMoreLinesOfCodePerClick[this.addLinesOfCode];
    this.nextCost.buyAutoClicker = this.cost.buyAutoClicker[this.autoClicker + 1];

    const sentence = '> Loaded ' + this.linesOfCode + ' line' + (this.linesOfCode > 1 ? 's' : '') + ' of code.';
    this.log.push(sentence);
    this.subscription = this.source.subscribe(val => {
      this.unlocker();
      this.linesOfCode += this.autoClicker;
      // TODO: here is the cycle
      localStorage.setItem('linesOfCode', this.linesOfCode.toString());
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private unlocker() {
    for (const u of this.unlocks) {
      if (!this.unlock[u] && this.linesOfCode >= this.unlockAt[u]) {
        this.unlock[u] = true;
      }
    }
    localStorage.setItem('unlock', JSON.stringify(this.unlock));
  }
}
