import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';

import { version } from '../../package.json';

import ascensions from '../../ascensions.json';
import achievements from '../../achievements.json';
import elements from '../../elements.json';
import config from '../../config.json';
import { Title } from '@angular/platform-browser';
import { KeyValue } from '@angular/common';

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
  title = config.title;
  source = interval(config.cycle);
  sourceSave = interval(config.saveEvery);

  elements = elements;

  achievementsUnlocked = false;
  achievements = achievements;

  ascensions = ascensions;

  firstClick = false;
  autoClick = false;

  ascii = '';

  primary;

  loading = true;

  modalExport = false;
  modalImport = false;
  modalReset = false;

  encodedString = '';

  grafics = true;


  public constructor(private titleService: Title ) {
    this.titleService.setTitle( this.title );
  }

  public singleClick(element: string): void {
    if (this.elements[this.elements[element].cost.element].value >= this.elements[element].cost.value) {
      this.elements[this.elements[element].cost.element].value -= this.elements[element].cost.value;
      this.elements[element].value += Math.floor(
        this.elements[element].addValue.value *
        this.elements[element].appliedBonus *
        this.ascensions.bonus
      );
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

  public toggleGrafics(): void {
    this.grafics = !this.grafics;
    localStorage.setItem('grafics', this.grafics.toString());
  }

  public ascend(): void {
    if (this.elements[this.primary].value >= this.ascensions.cost.next) {
      localStorage.removeItem('elements');
      this.ascensions.value++;
      this.ascensions.bonus = this.ascensions.calcBonus.next;
      this.ascensions.cost.next = this.calcCostForLevel(
        this.ascensions.value,
        this.ascensions.cost.initial,
        this.ascensions.cost.growth
      );
      this.ascensions.calcBonus.next = this.calcCostForLevel(
        this.ascensions.value,
        this.ascensions.calcBonus.initial,
        this.ascensions.calcBonus.growth
      );
      localStorage.setItem('ascensions', JSON.stringify(this.ascensions));
      window.location.reload();
    }
  }

  ngOnInit() {
    for (const e in this.elements) {
      if (this.elements.hasOwnProperty(e)) {
        if (this.elements[e].primary) {
          this.primary = e;
          break;
        }
      }
    }
    this.grafics = localStorage.getItem('grafics') === 'true';
    this.load();
    this.subscription = this.source.subscribe(val => { // cycle every second
      this.unlocker();
      this.unlockAchievements();
      this.calcBonus();
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
    if (this.grafics) {
      this.ascii = '';
      for (const e in this.elements) {
        if (this.elements.hasOwnProperty(e)) {
          const quotient10000 = this.elements[e].value / 10000;
          const remainder10000 =  this.elements[e].value % 10000;
          this.ascii += this.elements[e].ascii['10000'].repeat(quotient10000);
          if (this.ascii.length >= this.config.asciiCap) {
            continue;
          }

          const qoutient1000 = (remainder10000 > 1) ? remainder10000 / 1000 : this.elements[e].value / 1000;
          const remainder1000 =  remainder10000 % 1000;
          this.ascii += this.elements[e].ascii['1000'].repeat(qoutient1000);
          if (this.ascii.length >= this.config.asciiCap) {
            continue;
          }

          const quotient100 = (remainder1000 > 1) ? remainder1000 / 100 : this.elements[e].value / 100;
          const remainder100 =  remainder1000 % 100;
          this.ascii += this.elements[e].ascii['100'].repeat(quotient100);
          if (this.ascii.length >= this.config.asciiCap) {
            continue;
          }

          const quotient10 = (remainder100 > 1) ? remainder100 / 10 : this.elements[e].value / 10;
          const remainder10 =  remainder100 % 10;
          this.ascii += this.elements[e].ascii['10'].repeat(quotient10);
          if (this.ascii.length >= this.config.asciiCap) {
            continue;
          }

          this.ascii += this.elements[e].ascii['1'].repeat(remainder10);
        }
      }
    }
  }

  private autoClicker() {
    for (const e in this.elements) {
      if (this.elements.hasOwnProperty(e)) {
        if (this.elements[this.elements[e].cost.element].value >= (this.elements[e].cost.value * this.elements[e].autoClicker.value)) {
          this.elements[this.elements[e].cost.element].value -= (this.elements[e].cost.value * this.elements[e].autoClicker.value);
          this.elements[e].value += Math.floor(
            this.elements[e].autoClicker.value *
            this.elements[e].autoClickerMulti.value *
            this.elements[e].appliedBonus *
            this.ascensions.bonus
          );
          this.autoClick = true;
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

  public export() {
    let encodedData = '';
    encodedData += btoa(unescape(encodeURIComponent(JSON.stringify(this.elements)))) + '#';
    encodedData += btoa(unescape(encodeURIComponent(localStorage.getItem('unlockedAchievements')))) + '#';
    encodedData += btoa(unescape(encodeURIComponent(JSON.stringify(this.ascensions))));
    this.encodedString =  encodedData;
  }

  public doImport() {
    this.import((<HTMLInputElement>document.getElementById('importTextArea')).value);
  }

  private import(encodedData: string) {
    const split = encodedData.split('#');
    localStorage.setItem('elements', atob(decodeURIComponent(escape(split[0]))));
    localStorage.setItem('unlockedAchievements', atob(decodeURIComponent(escape(split[1]))));
    localStorage.setItem('ascensions', atob(decodeURIComponent(escape(split[2]))));
    window.location.reload();
  }

  private save() {
    localStorage.setItem('elements', JSON.stringify(this.elements));
  }
  private load() {
    this.loading = true;
    if (localStorage.getItem('elements')) {
      const loadedElements = JSON.parse(localStorage.getItem('elements'));
      for (const e in this.elements) {
        if (this.elements.hasOwnProperty(e)) {
          this.elements = { ...this.elements, [e]: { ...loadedElements[e]}};
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
    if (localStorage.getItem('ascensions')) {
      this.ascensions = JSON.parse(localStorage.getItem('ascensions'));
    }
    this.loading = false;
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

  private calcBonus() {
    for (const e in this.elements) {
      if (this.elements.hasOwnProperty(e)) {
        this.elements[e].appliedBonus = 1;
        this.elements[e].bonusReason = '';
        for (const innerE in this.elements) {
          if (this.elements.hasOwnProperty(innerE)) {
            if (this.elements[innerE].bonus && this.elements[innerE].bonus.element === e && this.elements[innerE].value > 0) {
              this.elements[e].appliedBonus += (this.elements[innerE].value / this.elements[innerE].bonus.divider);
              this.elements[e].bonusReason += this.elements[innerE].value + ' ' + this.elements[innerE].short + '; ';
              this.elements[innerE].givenBonus = (this.elements[innerE].value / this.elements[innerE].bonus.divider);
            }
          }
        }
      }
    }
  }


  valueAscOrder = (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return a.value.order > b.value.order ? 1 : -1;
  }

}
