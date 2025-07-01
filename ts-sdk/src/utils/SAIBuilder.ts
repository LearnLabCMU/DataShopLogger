import type { SAI } from '../types';

export class SAIBuilder {
  private selectionArray: string[] = [];
  private actionArray: string[] = [];
  private inputArray: string[] = [];

  constructor(selection?: string | string[], action?: string | string[], input?: string | string[]) {
    if (selection !== undefined) {
      this.setSelection(selection);
    }
    if (action !== undefined) {
      this.setAction(action);
    }
    if (input !== undefined) {
      this.setInput(input);
    }
  }

  setSelection(selection: string | string[]): SAIBuilder {
    this.selectionArray = Array.isArray(selection) ? [...selection] : [selection];
    return this;
  }

  setAction(action: string | string[]): SAIBuilder {
    this.actionArray = Array.isArray(action) ? [...action] : [action];
    return this;
  }

  setInput(input: string | string[]): SAIBuilder {
    this.inputArray = Array.isArray(input) ? [...input] : [input];
    return this;
  }

  build(): SAI {
    return {
      selection: this.selectionArray.length === 0 ? [] : this.selectionArray.length === 1 ? this.selectionArray[0]! : this.selectionArray,
      action: this.actionArray.length === 0 ? [] : this.actionArray.length === 1 ? this.actionArray[0]! : this.actionArray,
      input: this.inputArray.length === 0 ? [] : this.inputArray.length === 1 ? this.inputArray[0]! : this.inputArray,
    };
  }

  toXMLString(): string {
    let xml = '';

    for (const selection of this.selectionArray) {
      xml += `<selection>${this.escapeXML(selection)}</selection>`;
    }

    for (let i = 0; i < this.actionArray.length; i++) {
      if (i === 0) {
        xml += `<action>${this.escapeXML(this.actionArray[i]!)}`;
      } else {
        xml += `</action><action>${this.escapeXML(this.actionArray[i]!)}`;
      }
    }
    if (this.actionArray.length > 0) {
      xml += '</action>';
    }

    for (const input of this.inputArray) {
      xml += `<input><![CDATA[${input}]]></input>`;
    }

    return xml;
  }

  private escapeXML(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}