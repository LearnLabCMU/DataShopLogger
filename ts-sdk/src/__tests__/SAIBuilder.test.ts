import { SAIBuilder } from '../utils/SAIBuilder';

describe('SAIBuilder', () => {
  describe('constructor', () => {
    it('should create empty builder', () => {
      const builder = new SAIBuilder();
      const sai = builder.build();
      
      expect(sai.selection).toEqual([]);
      expect(sai.action).toEqual([]);
      expect(sai.input).toEqual([]);
    });

    it('should initialize with single values', () => {
      const builder = new SAIBuilder('button1', 'click', 'submit');
      const sai = builder.build();
      
      expect(sai.selection).toBe('button1');
      expect(sai.action).toBe('click');
      expect(sai.input).toBe('submit');
    });

    it('should initialize with array values', () => {
      const builder = new SAIBuilder(['btn1', 'btn2'], ['click', 'hover'], ['val1', 'val2']);
      const sai = builder.build();
      
      expect(sai.selection).toEqual(['btn1', 'btn2']);
      expect(sai.action).toEqual(['click', 'hover']);
      expect(sai.input).toEqual(['val1', 'val2']);
    });
  });

  describe('setters', () => {
    it('should set selection', () => {
      const builder = new SAIBuilder();
      builder.setSelection('newSelection');
      
      expect(builder.build().selection).toBe('newSelection');
    });

    it('should set action', () => {
      const builder = new SAIBuilder();
      builder.setAction('newAction');
      
      expect(builder.build().action).toBe('newAction');
    });

    it('should set input', () => {
      const builder = new SAIBuilder();
      builder.setInput('newInput');
      
      expect(builder.build().input).toBe('newInput');
    });

    it('should support method chaining', () => {
      const sai = new SAIBuilder()
        .setSelection('sel1')
        .setAction('act1')
        .setInput('inp1')
        .build();
      
      expect(sai.selection).toBe('sel1');
      expect(sai.action).toBe('act1');
      expect(sai.input).toBe('inp1');
    });
  });

  describe('toXMLString()', () => {
    it('should generate XML for single values', () => {
      const builder = new SAIBuilder('button1', 'click', 'submit');
      const xml = builder.toXMLString();
      
      expect(xml).toBe('<selection>button1</selection><action>click</action><input><![CDATA[submit]]></input>');
    });

    it('should generate XML for multiple selections', () => {
      const builder = new SAIBuilder(['btn1', 'btn2'], 'click', 'submit');
      const xml = builder.toXMLString();
      
      expect(xml).toContain('<selection>btn1</selection>');
      expect(xml).toContain('<selection>btn2</selection>');
    });

    it('should generate XML for multiple actions', () => {
      const builder = new SAIBuilder('button', ['click', 'hover'], 'submit');
      const xml = builder.toXMLString();
      
      expect(xml).toBe('<selection>button</selection><action>click</action><action>hover</action><input><![CDATA[submit]]></input>');
    });

    it('should generate XML for multiple inputs', () => {
      const builder = new SAIBuilder('button', 'click', ['val1', 'val2']);
      const xml = builder.toXMLString();
      
      expect(xml).toContain('<input><![CDATA[val1]]></input>');
      expect(xml).toContain('<input><![CDATA[val2]]></input>');
    });

    it('should escape XML special characters', () => {
      const builder = new SAIBuilder('button&<>"\'', 'click&test', 'normal');
      const xml = builder.toXMLString();
      
      expect(xml).toContain('button&amp;&lt;&gt;&quot;&apos;');
      expect(xml).toContain('click&amp;test');
      expect(xml).not.toContain('button&<>"\'');
    });

    it('should use CDATA for inputs', () => {
      const builder = new SAIBuilder('button', 'click', '<script>alert("test")</script>');
      const xml = builder.toXMLString();
      
      expect(xml).toContain('<input><![CDATA[<script>alert("test")</script>]]></input>');
    });

    it('should handle empty values', () => {
      const builder = new SAIBuilder('', '', '');
      const xml = builder.toXMLString();
      
      expect(xml).toBe('<selection></selection><action></action><input><![CDATA[]]></input>');
    });
  });

  describe('build()', () => {
    it('should return single value when array has one element', () => {
      const builder = new SAIBuilder();
      builder.setSelection(['onlyOne']);
      
      const sai = builder.build();
      expect(sai.selection).toBe('onlyOne');
      expect(Array.isArray(sai.selection)).toBe(false);
    });

    it('should return array when multiple elements', () => {
      const builder = new SAIBuilder();
      builder.setSelection(['one', 'two']);
      
      const sai = builder.build();
      expect(sai.selection).toEqual(['one', 'two']);
      expect(Array.isArray(sai.selection)).toBe(true);
    });

    it('should create independent copies of arrays', () => {
      const selections = ['btn1', 'btn2'];
      const builder = new SAIBuilder(selections, 'click', 'submit');
      
      const sai1 = builder.build();
      selections.push('btn3');
      const sai2 = builder.build();
      
      expect(sai1.selection).toEqual(['btn1', 'btn2']);
      expect(sai2.selection).toEqual(['btn1', 'btn2']);
    });
  });
});