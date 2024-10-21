import { InstanceInterface } from 'types';

export interface CreateTemplateParametersArgumentInterface {
  elementName: string;
  languageCode: string;
  category: WabaTemplateCategoryEnum;
  templateType: WabaTemplateTypeEnum;
  vertical: string;
  content: string;
  header?: string;
  footer?: string;
  buttons?: TemplateButtonInterface[];
  example: string;
  enableSample?: boolean;
  allowTemplateCategoryChange?: boolean;
  exampleHeader?: string;
  addSecurityRecommendation?: boolean;
  codeExpirationMinutes?: number;
}

export interface TemplateButtonInterface {
  text: string;
  type: TemplateButtonTypesEnum;
  value: string;
}

export enum TemplateButtonTypesEnum {
  PhoneNumber = 'PHONE_NUMBER',
  Url = 'URL',
}

export type CreateTemplateParameters = CreateTemplateParametersArgumentInterface &
  InstanceInterface;

export interface WabaTemplateResponseInterface {
  template: WabaTemplateInterface;
}

export interface WabaTemplateInterface {
  appId: string;
  category: WabaTemplateCategoryEnum;
  containerMeta: string;
  createdOn: number;
  data: string;
  elementName: string;
  id: string;
  languageCode: string;
  meta: string;
  modifiedOn: string;
  priority: number;
  retry: number;
  stage: string;
  status: string;
  templateType: WabaTemplateTypeEnum;
  vertical: string;
  wabaId: string;
}

export enum WabaTemplateCategoryEnum {
  Authentication = 'AUTHENTICATION',
  Marketing = 'MARKETING',
  Utility = 'UTILITY',
}

export enum WabaTemplateTypeEnum {
  Text = 'TEXT',
  Image = 'IMAGE',
  Video = 'VIDEO',
}

export interface GetTemplatesResponseInterface {
  templates: WabaTemplateInterface[];
}

export interface GetTemplateByIdParametersInterface extends InstanceInterface {
  templateId: string;
  rtkSessionId?: number;
}

export interface DeleteTemplateParametersInterface extends InstanceInterface {
  elementName: string;
}

export interface WabaTemplateStatusResponseInterface {
  status: string;
}

export type DeleteTemplateByIdParameters = DeleteTemplateParametersInterface &
  Pick<GetTemplateByIdParametersInterface, 'templateId'>;

interface WabaTemplateParametersInterface<T extends NonNullable<unknown>> {
  templateId: string;
  templateParams: T;
}

export type SendTemplateParameters = InstanceInterface & WabaTemplateParametersInterface<string[]>;

export type EditTemplateParameters =
  WabaTemplateParametersInterface<EditTemplateParametersArgumentInterface> & InstanceInterface;

interface EditTemplateParametersArgumentInterface
  extends Partial<
    Pick<
      CreateTemplateParametersArgumentInterface,
      | 'content'
      | 'templateType'
      | 'example'
      | 'enableSample'
      | 'header'
      | 'footer'
      | 'buttons'
      | 'category'
    >
  > {
  exampleMedia?: string;
  mediaId?: string;
  mediaUrl?: string;
}
