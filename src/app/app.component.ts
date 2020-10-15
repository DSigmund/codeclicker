import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';

import { version } from '../../package.json';

import achievements from '../../achievements.json';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  subscriptionSave: Subscription;

  title = 'codeclicker';
  public version: string = version;
  source = interval(1000);
  sourceSave = interval(10000);

  elements = {
    linesOfCode: {
      name: 'Lines of Code',
      short: 'LoC',
      ascii: {
        1: '.',
        10: 'o',
        100: 'O'
      },
      unlockAt: {
        element: 'linesOfCode',
        value: 0
      },
      unlocked: true,
      value: 0,
      button: {
        title: 'Write Code',
        clicked: 0,
        unlockAt: {
          element: 'linesOfCode',
          value: 0
        },
        unlocked: true
      },
      addValue: {
        value: 1,
        level: 0,
        unlockAt: {
          element: 'linesOfCode',
          value: 10
        },
        unlocked: false,
        cost: {
          initial: 10,
          growth: 100,
          next: 10
        },
        button: {
          title: 'More Lines of Code per Click!'
        }
      },
      autoClicker: {
        name: 'Bots',
        value: 0,
        level: 0,
        unlockAt: {
          element: 'linesOfCode',
          value: 100
        },
        unlocked: false,
        cost: {
          initial: 100,
          growth: 100,
          next: 100
        },
        button: {
          title: 'Buy a Bot!'
        }
      },
      autoClickerMulti: {
        value: 1,
        level: 0,
        unlockAt: {
          element: 'linesOfCode',
          value: 200
        },
        unlocked: false,
        cost: {
          initial: 200,
          growth: 120,
          next: 200
        },
        button: {
          title: 'Enhance the Bots!'
        }
      }
    }
  };


  achievementsUnlocked = false;
  achievements = achievements;

  public singleClick(element: string): void {
    this.elements[element].value += this.elements[element].addValue.value;
    this.elements[element].button.clicked += 1;
  }

  public buy(element: string, what: string): void {
    const cost = this.calcCostForLevel(
      this.elements[element][what].level,
      this.elements[element][what].cost.initial,
      this.elements[element][what].cost.growth
    );
    const nextCost = this.calcCostForLevel(
      this.elements[element][what].level + 1,
      this.elements[element][what].cost.initial,
      this.elements[element][what].cost.growth
    );
    if (this.elements[element].value >= cost) {
      this.elements[element].value -= cost;
      this.elements[element][what].level += 1;
      this.elements[element][what].value += 1;
      this.elements[element][what].cost.next = nextCost;
    }
  }

  private calcCostForLevel(level: number, base: number, growth: number): number {
    return Math.floor(base * Math.pow((1 + growth / 100), level));
  }

  public reset(): void {
    localStorage.clear();
    window.location.reload();
  }

  ngOnInit() {
    this.load();
    this.subscription = this.source.subscribe(val => { // cycle every second
      this.unlocker();
      this.unlockAchievements();
      this.autoClicker();
    });
    this.subscriptionSave = this.sourceSave.subscribe(val => { // cycle every 10 seconds
      this.save();
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private autoClicker() {
    for (const e in this.elements) {
      if (this.elements.hasOwnProperty(e)) {
        this.elements[e].value += this.elements[e].autoClicker.value * this.elements[e].autoClickerMulti.value ;
      }
    }
  }

  private unlocker() {
    for (const e in this.elements) {
      if (this.elements.hasOwnProperty(e)) {
        const el = this.elements[e];
        if (!el.unlocked &&
          this.elements[el.unlockAt.element].value >= el.unlockAt.value) {
          this.elements[e].unlocked = true;
        }
        if (!el.button.unlocked &&
          this.elements[el.button.unlockAt.element].value >= el.button.unlockAt.value) {
          this.elements[e].button.unlocked = true;
        }
        if (!el.addValue.unlocked &&
          this.elements[el.addValue.unlockAt.element].value >= el.addValue.unlockAt.value) {
          this.elements[e].addValue.unlocked = true;
        }
        if (!el.autoClicker.unlocked &&
          this.elements[el.autoClicker.unlockAt.element].value >= el.autoClicker.unlockAt.value) {
          this.elements[e].autoClicker.unlocked = true;
        }
        if (!el.autoClickerMulti.unlocked &&
          this.elements[el.autoClickerMulti.unlockAt.element].value >= el.autoClickerMulti.unlockAt.value) {
          this.elements[e].autoClickerMulti.unlocked = true;
        }
      }
    }
  }
  private save() {
    localStorage.setItem('elements', JSON.stringify(this.elements));
  }
  private load() {
    if (localStorage.getItem('elements')) {
      const loadedElements = JSON.parse(localStorage.getItem('elements'));
      for (const e in this.elements) {
        if (this.elements.hasOwnProperty(e)) {
          this.elements[e].value = loadedElements[e].value;
          this.elements[e].unlocked = loadedElements[e].unlocked;
          this.elements[e].button.clicked = loadedElements[e].button.clicked;
          this.elements[e].button.unlocked = loadedElements[e].button.unlocked;
          this.elements[e].addValue.level = loadedElements[e].addValue.level;
          this.elements[e].addValue.value = loadedElements[e].addValue.value;
          this.elements[e].addValue.unlocked = loadedElements[e].addValue.unlocked;
          this.elements[e].addValue.cost.next = loadedElements[e].addValue.cost.next;
          this.elements[e].autoClicker.level = loadedElements[e].autoClicker.level;
          this.elements[e].autoClicker.value = loadedElements[e].autoClicker.value;
          this.elements[e].autoClicker.unlocked = loadedElements[e].autoClicker.unlocked;
          this.elements[e].autoClicker.cost.next = loadedElements[e].autoClicker.cost.next;
          this.elements[e].autoClickerMulti.level = loadedElements[e].autoClickerMulti.level;
          this.elements[e].autoClickerMulti.value = loadedElements[e].autoClickerMulti.value;
          this.elements[e].autoClickerMulti.unlocked = loadedElements[e].autoClickerMulti.unlocked;
          this.elements[e].autoClickerMulti.cost.next = loadedElements[e].autoClickerMulti.cost.next;
        }
      }
    }

    if (localStorage.getItem('unlockedAchievements')) {
      const unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements'));
      for (const uA of unlockedAchievements) {
        this.achievements.find(x => x.name === uA).unlocked = true;
        this.achievementsUnlocked = true;
      }
    }
  }
  private unlockAchievements() {
    for (const a of this.achievements) {
      if (!a.unlocked && this.returnValueFromElements(a.unlockAt.what) >= a.unlockAt.value) {
        this.achievements.find(x => x.name === a.name).unlocked = true;
        this.achievementsUnlocked = true;
        const unlockedAchievements = JSON.parse(localStorage.getItem('unlockedAchievements')) || [];
        unlockedAchievements.push(a.name);
        localStorage.setItem('unlockedAchievements', JSON.stringify(unlockedAchievements));
      }
    }
  }
  private returnValueFromElements(path: string) {
    return path.split('.').reduce((o, i) => o[i], this.elements);
  }
}
