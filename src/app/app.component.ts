import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';

import { version } from '../../package.json';

import achievements from '../../achievements.json';
import elements from '../../elements.json';
import config from '../../config.json';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  subscription: Subscription;
  subscriptionSave: Subscription;

  public version: string = version;

  config = config;
  source = interval(config.cycle);
  sourceSave = interval(config.saveEvery);

  elements = elements;

  achievementsUnlocked = false;
  achievements = achievements;

  firstClick = false;

  ascii = '';

  public singleClick(element: string): void {
    if (this.elements[this.elements[element].cost.element].value >= this.elements[element].cost.value) {
      this.elements[this.elements[element].cost.element].value -= this.elements[element].cost.value;
      this.elements[element].value += this.elements[element].addValue.value;
      this.elements[element].button.clicked += 1;
      this.firstClick = true;
    }
  }
  public displaySingleClickCost(element: string): string {
    return '(' + this.elements[element].cost.value + ' ' + this.elements[this.elements[element].cost.element].short + ')';
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
      this.drawASCII();
    });
    this.subscriptionSave = this.sourceSave.subscribe(val => { // cycle every 10 seconds
      this.save();
    });
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private drawASCII(): void {
    this.ascii = '';
    for (const e in this.elements) {
      if (this.elements.hasOwnProperty(e)) {
        const quotient10000 = this.elements[e].value / 10000;
        const remainder10000 =  this.elements[e].value % 10000;
        this.ascii += this.elements[e].ascii['10000'].repeat(quotient10000);

        const qoutient1000 = remainder10000 / 1000;
        const remainder1000 =  remainder10000 % 1000;
        this.ascii += this.elements[e].ascii['1000'].repeat(qoutient1000);

        const quotient100 = remainder1000 / 100;
        const remainder100 =  remainder1000 % 100;
        this.ascii += this.elements[e].ascii['100'].repeat(quotient100);

        const quotient10 = remainder100 / 10;
        const remainder10 =  remainder100 % 10;
        this.ascii += this.elements[e].ascii['10'].repeat(quotient10);

        this.ascii += this.elements[e].ascii['1'].repeat(remainder10);
      }
    }
  }

  private autoClicker() {
    for (const e in this.elements) {
      if (this.elements.hasOwnProperty(e)) {
        if (this.elements[this.elements[e].cost.element].value >= (this.elements[e].cost.value * this.elements[e].autoClicker.value)) {
          this.elements[this.elements[e].cost.element].value -= (this.elements[e].cost.value * this.elements[e].autoClicker.value);
          this.elements[e].value += this.elements[e].autoClicker.value * this.elements[e].autoClickerMulti.value ;
        }
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
