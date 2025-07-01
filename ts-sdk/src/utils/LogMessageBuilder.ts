import type { LogConfiguration, SAI, ActionEvaluation } from '../types';
import { SAIBuilder } from './SAIBuilder';

export class LogMessageBuilder {
  private readonly xmlProlog = '<?xml version="1.0" encoding="UTF-8"?>';
  private readonly DTDVersion = '4';
  private customFields: Map<string, string | number | boolean> = new Map();

  constructor(private configuration: LogConfiguration) {}

  resetCustomFields(): void {
    this.customFields.clear();
  }

  addCustomField(name: string, value: string | number | boolean): void {
    this.customFields.set(name, value);
  }

  addCustomFields(fields?: Record<string, unknown>): void {
    if (!fields) return;
    
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined && value !== null) {
        this.addCustomField(key, String(value));
      }
    }
  }

  formatTimeStamp(date: Date): string {
    return date.toISOString().replace('T', ' ').replace('Z', '');
  }

  createLogSessionStart(): string {
    const timestamp = this.formatTimeStamp(new Date());
    
    let message = `<log_session_start>`;
    message += `<log_action>START_LOG</log_action>`;
    message += `<date_time>${timestamp} UTC</date_time>`;
    message += `<timezone>UTC</timezone>`;
    message += `<session_id>${this.configuration.session_id || ''}</session_id>`;
    message += `<user_guid>${this.configuration.user_guid || ''}</user_guid>`;
    message += `</log_session_start>`;
    
    return message;
  }

  createContextMessage(): string {
    const vars = this.configuration;
    const now = new Date();
    
    let message = `<context_message context_message_id="${vars.context_message_id || ''}" name="START_PROBLEM">`;
    
    message += this.makeMetaElement(now);
    
    // Class element
    if (vars.class_name) {
      message += '<class>';
      message += `<name>${this.escapeXML(vars.class_name)}</name>`;
      if (vars.school_name) message += `<school>${this.escapeXML(vars.school_name)}</school>`;
      if (vars.period_name) message += `<period>${this.escapeXML(vars.period_name)}</period>`;
      if (vars.class_description) message += `<description>${this.escapeXML(vars.class_description)}</description>`;
      if (vars.instructor_name) message += `<instructor>${this.escapeXML(vars.instructor_name)}</instructor>`;
      message += '</class>';
    }
    
    // Dataset element
    message += '<dataset>';
    message += `<name>${this.escapeXML(vars.dataset_name || 'UnassignedDataset')}</name>`;
    
    // Build nested dataset levels
    let levelContent = '';
    let currentLevel = 1;
    let hasLevels = false;
    
    // Check for all dataset levels (1-10 should be enough)
    while (currentLevel <= 10) {
      const levelNameKey = `dataset_level_name${currentLevel}`;
      const levelTypeKey = `dataset_level_type${currentLevel}`;
      const levelName = vars[levelNameKey];
      const levelType = vars[levelTypeKey];
      
      if (levelName && levelType) {
        hasLevels = true;
        levelContent += `<level type="${this.escapeXML(String(levelType))}">`;
        levelContent += `<name>${this.escapeXML(String(levelName))}</name>`;
        currentLevel++;
      } else {
        break;
      }
    }
    
    // Add problem element at the deepest level
    if (hasLevels) {
      levelContent += '<problem tutorFlag="tutor">';
      levelContent += `<name>${this.escapeXML(vars.problem_name || '')}</name>`;
      if (vars.problem_context) {
        levelContent += `<context>${this.escapeXML(vars.problem_context)}</context>`;
      }
      levelContent += '</problem>';
      
      // Close all level tags
      for (let i = currentLevel - 2; i >= 1; i--) {
        levelContent += '</level>';
      }
      
      message += levelContent;
    }
    
    message += '</dataset>';
    message += '</context_message>';
    
    return message;
  }

  createSemanticEventToolMessage(
    sai: SAI,
    transactionID: string,
    semanticEventName: string,
    semanticEventSubtype?: string,
    trigger?: string
  ): string {
    const saiBuilder = new SAIBuilder(sai.selection, sai.action, sai.input);
    
    let message = `<tool_message context_message_id="${this.configuration.context_message_id || ''}">`;
    message += this.makeMetaElement(new Date());
    message += `<semantic_event transaction_id="${transactionID}" name="${semanticEventName}"`;
    if (semanticEventSubtype) {
      message += ` subtype="${semanticEventSubtype}"`;
    }
    if (trigger) {
      message += ` trigger="${trigger}"`;
    }
    message += '/>';
    message += `<event_descriptor>`;
    message += saiBuilder.toXMLString();
    message += `</event_descriptor>`;
    
    // Add custom fields (no wrapper, individual elements)
    for (const [name, value] of this.customFields) {
      message += `<custom_field><name>${this.escapeXML(name)}</name><value>${this.escapeXML(String(value))}</value></custom_field>`;
    }
    
    message += `</tool_message>`;
    
    return message;
  }

  createTutorMessage(
    sai: SAI,
    transactionID: string,
    semanticEventName: string,
    evaluation: ActionEvaluation,
    feedback: string,
    semanticEventSubtype?: string,
    skills?: Array<{ name: string; category?: string }>
  ): string {
    const saiBuilder = new SAIBuilder(sai.selection, sai.action, sai.input);
    
    let message = `<tutor_message context_message_id="${this.configuration.context_message_id || ''}">`;
    message += this.makeMetaElement(new Date());
    message += `<semantic_event transaction_id="${transactionID}" name="${semanticEventName}"`;
    if (semanticEventSubtype) {
      message += ` subtype="${semanticEventSubtype}"`;
    }
    message += '/>';
    message += `<event_descriptor>`;
    message += saiBuilder.toXMLString();
    message += `</event_descriptor>`;
    
    // Action evaluation
    message += '<action_evaluation';
    if (evaluation.classification) {
      message += ` classification="${evaluation.classification}"`;
    }
    if (evaluation.currentHintNumber !== undefined) {
      message += ` current_hint_number="${evaluation.currentHintNumber}"`;
    }
    if (evaluation.totalHintsAvailable !== undefined) {
      message += ` total_hints_available="${evaluation.totalHintsAvailable}"`;
    }
    message += `>${evaluation.evaluation}</action_evaluation>`;
    
    // Tutor advice/feedback
    if (feedback) {
      message += `<tutor_advice>${feedback}</tutor_advice>`;
    }
    
    // Skills/Knowledge Components
    if (skills && skills.length > 0) {
      message += '<skills>';
      for (const skill of skills) {
        message += '<skill>';
        message += `<name>${this.escapeXML(skill.name)}</name>`;
        if (skill.category) {
          message += `<category>${this.escapeXML(skill.category)}</category>`;
        }
        message += '</skill>';
      }
      message += '</skills>';
    }
    
    // Add custom fields (no wrapper, individual elements)
    for (const [name, value] of this.customFields) {
      message += `<custom_field><name>${this.escapeXML(name)}</name><value>${this.escapeXML(String(value))}</value></custom_field>`;
    }
    
    message += `</tutor_message>`;
    
    return message;
  }

  wrapForDataShop(message: string): string {
    return `${this.xmlProlog}<tutor_related_message_sequence version_number="${this.DTDVersion}">${message}</tutor_related_message_sequence>`;
  }

  private makeMetaElement(timestamp: Date): string {
    let meta = '<meta>';
    meta += `<user_id>${this.escapeXML(this.configuration.user_guid || '')}</user_id>`;
    meta += `<session_id>${this.escapeXML(this.configuration.session_id || '')}</session_id>`;
    meta += `<time>${this.formatTimeStamp(timestamp)} UTC</time>`;
    meta += `<time_zone>UTC</time_zone>`;
    meta += '</meta>';
    return meta;
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