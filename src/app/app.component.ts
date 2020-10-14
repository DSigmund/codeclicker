import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';

import { version } from '../../package.json';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  subscription: Subscription;

  title = 'codeclicker';
  public version: string = version;
  source = interval(1000);

  linesOfCode = 0;
  addLinesOfCode = 1;
  autoClicker = 0;
  autoClickerMulti = 1;

  log = [];
  adjectives = [
    'beautiful',
    'nice',
    'terrific',
    'bad'
  ];
  unlocks = [
    'buyMoreLinesOfCodePerClick',
    'buyAutoClicker',
    'buyAutoClickerMulti'
  ];
  unlockAt = {
    buyMoreLinesOfCodePerClick: 10,
    buyAutoClicker: 100,
    buyAutoClickerMulti: 200
  };

  unlock = {
    buyMoreLinesOfCodePerClick: false,
    buyAutoClicker: false,
    buyAutoClickerMulti: false
  };

  cost = {
    buyMoreLinesOfCodePerClick: {
      initial: 10,
      growth: 100
    },
    buyAutoClicker: {
      initial: 100,
      growth: 100
    },
    buyAutoClickerMulti: {
      initial: 200,
      growth: 120
    }
  };

  nextCost = {
    buyMoreLinesOfCodePerClick: 10,
    buyAutoClicker: 100,
    buyAutoClickerMulti: 200
  };

  achievementsUnlocked = false;
  achievements = [
    {
      name: 'Click a Button',
      unlocked: false,
      unlockAt: {
        what: 'linesOfCode',
        value: 1
      }
    },
    {
      name: '1000 Lines of Code',
      unlocked: false,
      unlockAt: {
        what: 'linesOfCode',
        value: 1000
      }
    },
    {
      name: 'Army of Bots',
      unlocked: false,
      unlockAt: {
        what: 'autoClicker',
        value: 10
      }
    }
  ];

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
    cost = this.calcCostForLevel(this[obj], this.cost[what].initial, this.cost[what].growth);
    nextCost = this.calcCostForLevel(this[obj] + 1, this.cost[what].initial, this.cost[what].growth);
    if (this.linesOfCode >= cost) {
      this.linesOfCode -= cost;
      this.nextCost[what] = nextCost;
      this[obj]++;
      localStorage.setItem(obj, this[obj].toString());
    }
  }

  private calcCostForLevel(level: number, base: number, growth: number): number {
    return Math.floor(base * Math.pow((1 + growth / 100), level));
  }

  public reset(): void {
    this.autoClicker = 0;
    this.addLinesOfCode = 1;
    this.linesOfCode = 0;
    this.unlock = {
      buyMoreLinesOfCodePerClick: false,
      buyAutoClicker: false,
      buyAutoClickerMulti: false
    };
    this.nextCost.buyMoreLinesOfCodePerClick = this.calcCostForLevel(this.addLinesOfCode, this.cost.buyMoreLinesOfCodePerClick.initial, this.cost.buyMoreLinesOfCodePerClick.growth);
    this.nextCost.buyAutoClicker = this.calcCostForLevel(this.autoClicker, this.cost.buyAutoClicker.initial, this.cost.buyAutoClicker.growth);
    this.nextCost.buyAutoClickerMulti = this.calcCostForLevel(this.autoClickerMulti, this.cost.buyAutoClickerMulti.initial, this.cost.buyAutoClickerMulti.growth);

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

    if (localStorage.getItem('unlockedAchievements')) {
      const unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements'));
      for (const uA of unlockedAchievements) {
        this.achievements.find(x => x.name === uA).unlocked = true;
        this.achievementsUnlocked = true;
      }
    }

    this.nextCost.buyMoreLinesOfCodePerClick = this.calcCostForLevel(this.addLinesOfCode, this.cost.buyMoreLinesOfCodePerClick.initial, this.cost.buyMoreLinesOfCodePerClick.growth);
    this.nextCost.buyAutoClicker = this.calcCostForLevel(this.autoClicker, this.cost.buyAutoClicker.initial, this.cost.buyAutoClicker.growth);
    this.nextCost.buyAutoClickerMulti = this.calcCostForLevel(this.autoClickerMulti, this.cost.buyAutoClickerMulti.initial, this.cost.buyAutoClickerMulti.growth);

    const sentence = '> Loaded ' + this.linesOfCode + ' line' + (this.linesOfCode > 1 ? 's' : '') + ' of code.';
    this.log.push(sentence);
    this.subscription = this.source.subscribe(val => { // cycle every second
      this.unlocker();
      this.unlockAchievements();
      this.linesOfCode += this.autoClicker * this.autoClickerMulti;
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
        localStorage.setItem('unlock', JSON.stringify(this.unlock));
      }
    }
  }
  private unlockAchievements() {
    for (const a of this.achievements) {
      if (!a.unlocked && this[a.unlockAt.what] >= a.unlockAt.value) {
        this.achievements.find(x => x.name === a.name).unlocked = true;
        this.achievementsUnlocked = true;
        const unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
        unlockedAchievements.push(a.name);
        localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
      }
    }
  }
}
