import { LogMessageBuilder } from '../utils/LogMessageBuilder';
import type { LogConfiguration, ActionEvaluation } from '../types';

describe('LogMessageBuilder', () => {
  let builder: LogMessageBuilder;
  let config: LogConfiguration;

  beforeEach(() => {
    config = {
      session_id: 'test-session-123',
      context_message_id: 'test-context-456',
      user_guid: 'test-user-789',
      dataset_name: 'TestDataset',
      dataset_level_name1: 'Level1',
      dataset_level_type1: 'Type1',
      problem_name: 'TestProblem',
      problem_context: 'Test context for problem',
      class_name: 'TestClass',
      school_name: 'TestSchool',
      period_name: 'TestPeriod',
      class_description: 'Test class description',
      instructor_name: 'TestInstructor',
    };
    builder = new LogMessageBuilder(config);
  });

  describe('formatTimeStamp()', () => {
    it('should format date to ISO string without T and Z', () => {
      const date = new Date('2023-06-15T14:30:45.123Z');
      const formatted = builder.formatTimeStamp(date);
      
      expect(formatted).toBe('2023-06-15 14:30:45.123');
    });
  });

  describe('createLogSessionStart()', () => {
    it('should create log session start message', () => {
      const message = builder.createLogSessionStart();
      
      expect(message).toContain('<log_session_start');
      expect(message).toContain('timezone="UTC"');
      expect(message).toContain('date_time="');
      expect(message).toContain('UTC"');
      expect(message).toContain(`session_id="${config.session_id}"`);
      expect(message).toContain(`user_guid="${config.user_guid}"`);
      expect(message).toContain('info_type="tutor_message.dtd"/>');
    });

    it('should handle missing session_id and user_guid', () => {
      const minimalConfig: LogConfiguration = {};
      const minimalBuilder = new LogMessageBuilder(minimalConfig);
      const message = minimalBuilder.createLogSessionStart();
      
      expect(message).toContain('session_id=""');
      expect(message).toContain('user_guid=""');
    });
  });

  describe('createContextMessage()', () => {
    it('should create context message with all fields', () => {
      const message = builder.createContextMessage();
      
      expect(message).toContain('<context_message');
      expect(message).toContain(`context_message_id="${config.context_message_id}"`);
      expect(message).toContain('name="START_PROBLEM"');
      expect(message).toContain('<meta>');
      expect(message).toContain('<class>');
      expect(message).toContain(`<name>${config.class_name}</name>`);
      expect(message).toContain(`<school>${config.school_name}</school>`);
      expect(message).toContain(`<period>${config.period_name}</period>`);
      expect(message).toContain(`<description>${config.class_description}</description>`);
      expect(message).toContain(`<instructor>${config.instructor_name}</instructor>`);
      expect(message).toContain('</class>');
      expect(message).toContain('<dataset>');
      expect(message).toContain(`<name><![CDATA[${config.dataset_name}]]></name>`);
      expect(message).toContain(`<level type="${config.dataset_level_type1}">`);
      expect(message).toContain('<problem tutorFlag="tutor">');
      expect(message).toContain(`<name><![CDATA[${config.problem_name}]]></name>`);
      expect(message).toContain(`<context><![CDATA[${config.problem_context}]]></context>`);
      expect(message).toContain('</context_message>');
    });

    it('should handle minimal configuration', () => {
      const minimalConfig: LogConfiguration = {};
      const minimalBuilder = new LogMessageBuilder(minimalConfig);
      const message = minimalBuilder.createContextMessage();
      
      expect(message).toContain('context_message_id=""');
      expect(message).toContain('<name><![CDATA[UnassignedDataset]]></name>');
      expect(message).not.toContain('<class>');
      expect(message).not.toContain('<level');
    });

    it('should handle multiple dataset levels', () => {
      config.dataset_level_name1 = 'Level1';
      config.dataset_level_type1 = 'Type1';
      config.dataset_level_name2 = 'Level2';
      config.dataset_level_type2 = 'Type2';
      const multiLevelBuilder = new LogMessageBuilder(config);
      const message = multiLevelBuilder.createContextMessage();
      
      expect(message).toContain('<level type="Type1">');
      expect(message).toContain('<name><![CDATA[Level1]]></name>');
      expect(message).toContain('<level type="Type2">');
      expect(message).toContain('<name><![CDATA[Level2]]></name>');
    });

    it('should handle class without optional fields', () => {
      const partialConfig: LogConfiguration = {
        class_name: 'OnlyClassName',
        dataset_name: 'TestDataset',
      };
      const partialBuilder = new LogMessageBuilder(partialConfig);
      const message = partialBuilder.createContextMessage();
      
      expect(message).toContain('<class>');
      expect(message).toContain('<name>OnlyClassName</name>');
      expect(message).not.toContain('<school>');
      expect(message).not.toContain('<period>');
      expect(message).not.toContain('<description>');
      expect(message).not.toContain('<instructor>');
    });
  });

  describe('createSemanticEventToolMessage()', () => {
    it('should create tool message with all fields', () => {
      const sai = { selection: 'button1', action: 'click', input: 'submit' };
      const message = builder.createSemanticEventToolMessage(
        sai,
        'T12345',
        'ATTEMPT',
        'subtype',
        'user'
      );
      
      expect(message).toContain('<tool_message');
      expect(message).toContain(`context_message_id="${config.context_message_id}"`);
      expect(message).toContain('<meta>');
      expect(message).toContain('<semantic_event');
      expect(message).toContain('transaction_id="T12345"');
      expect(message).toContain('name="ATTEMPT"');
      expect(message).toContain('subtype="subtype"');
      expect(message).toContain('trigger="user"');
      expect(message).toContain('<event_descriptor>');
      expect(message).toContain('<selection>button1</selection>');
      expect(message).toContain('<action>click</action>');
      expect(message).toContain('<input><![CDATA[submit]]></input>');
      expect(message).toContain('</event_descriptor>');
      expect(message).toContain('</tool_message>');
    });

    it('should handle optional parameters', () => {
      const sai = { selection: 'sel', action: 'act', input: 'inp' };
      const message = builder.createSemanticEventToolMessage(sai, 'T123', 'TEST');
      
      expect(message).not.toContain('subtype=');
      expect(message).not.toContain('trigger=');
    });

    it('should include custom fields', () => {
      builder.addCustomField('field1', 'value1');
      builder.addCustomField('field2', 123);
      builder.addCustomField('field3', true);
      
      const sai = { selection: 'sel', action: 'act', input: 'inp' };
      const message = builder.createSemanticEventToolMessage(sai, 'T123', 'TEST');
      
      expect(message).toContain('<custom_field><name>field1</name><value>value1</value></custom_field>');
      expect(message).toContain('<custom_field><name>field2</name><value>123</value></custom_field>');
      expect(message).toContain('<custom_field><name>field3</name><value>true</value></custom_field>');
    });
  });

  describe('createTutorMessage()', () => {
    it('should create tutor message with string evaluation', () => {
      const sai = { selection: 'input1', action: 'setValue', input: '42' };
      const evaluation: ActionEvaluation = { evaluation: 'CORRECT' };
      const message = builder.createTutorMessage(
        sai,
        'T12345',
        'RESULT',
        evaluation,
        'Great job!',
        'subtype'
      );
      
      expect(message).toContain('<tutor_message');
      expect(message).toContain(`context_message_id="${config.context_message_id}"`);
      expect(message).toContain('<semantic_event');
      expect(message).toContain('transaction_id="T12345"');
      expect(message).toContain('name="RESULT"');
      expect(message).toContain('subtype="subtype"');
      expect(message).toContain('<action_evaluation>CORRECT</action_evaluation>');
      expect(message).toContain('<tutor_advice>Great job!</tutor_advice>');
    });

    it('should handle complex evaluation object', () => {
      const sai = { selection: 'input1', action: 'setValue', input: '42' };
      const evaluation: ActionEvaluation = {
        evaluation: 'HINT',
        classification: 'hint-class',
        currentHintNumber: 2,
        totalHintsAvailable: 5,
      };
      const message = builder.createTutorMessage(
        sai,
        'T12345',
        'HINT_MSG',
        evaluation,
        'Try again'
      );
      
      expect(message).toContain('HINT');
      expect(message).toContain('classification="hint-class"');
      expect(message).toContain('current_hint_number="2"');
      expect(message).toContain('total_hints_available="5"');
    });

    it('should handle empty feedback', () => {
      const sai = { selection: 'sel', action: 'act', input: 'inp' };
      const evaluation: ActionEvaluation = { evaluation: 'CORRECT' };
      const message = builder.createTutorMessage(sai, 'T123', 'TEST', evaluation, '');
      
      expect(message).toContain('CORRECT</action_evaluation>');
    });
  });

  describe('custom fields management', () => {
    it('should reset custom fields', () => {
      builder.addCustomField('field1', 'value1');
      builder.resetCustomFields();
      
      const sai = { selection: 'sel', action: 'act', input: 'inp' };
      const message = builder.createSemanticEventToolMessage(sai, 'T123', 'TEST');
      
      expect(message).not.toContain('<custom_field>');
    });

    it('should add multiple custom fields from object', () => {
      const fields = {
        field1: 'value1',
        field2: 123,
        field3: true,
        field4: null,
        field5: undefined,
      };
      
      builder.addCustomFields(fields);
      
      const sai = { selection: 'sel', action: 'act', input: 'inp' };
      const message = builder.createSemanticEventToolMessage(sai, 'T123', 'TEST');
      
      expect(message).toContain('<name>field1</name><value>value1</value>');
      expect(message).toContain('<name>field2</name><value>123</value>');
      expect(message).toContain('<name>field3</name><value>true</value>');
      expect(message).not.toContain('field4');
      expect(message).not.toContain('field5');
    });

    it('should handle undefined custom fields object', () => {
      builder.addCustomFields(undefined);
      
      const sai = { selection: 'sel', action: 'act', input: 'inp' };
      const message = builder.createSemanticEventToolMessage(sai, 'T123', 'TEST');
      
      expect(message).not.toContain('<custom_fields>');
    });
  });

  describe('wrapForDataShop()', () => {
    it('should wrap message with XML prolog and sequence tags', () => {
      const innerMessage = '<test>content</test>';
      const wrapped = builder.wrapForDataShop(innerMessage);
      
      expect(wrapped).toBe(
        '<?xml version="1.0" encoding="UTF-8"?>' +
        '<tutor_related_message_sequence version_number="4">' +
        innerMessage +
        '</tutor_related_message_sequence>'
      );
    });
  });

  describe('XML escaping', () => {
    it('should escape special characters in all fields', () => {
      config.class_name = 'Class & <Test>';
      config.school_name = 'School "Quote"';
      config.instructor_name = "Instructor's Name";
      const escapingBuilder = new LogMessageBuilder(config);
      
      const message = escapingBuilder.createContextMessage();
      
      expect(message).toContain('Class &amp; &lt;Test&gt;');
      expect(message).toContain('School &quot;Quote&quot;');
      expect(message).toContain('Instructor&apos;s Name');
    });
  });
});