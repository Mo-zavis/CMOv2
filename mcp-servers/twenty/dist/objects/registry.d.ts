export interface TwentyObject {
    singular: string;
    plural: string;
    category: 'core_crm' | 'productivity' | 'messaging' | 'calendar' | 'automation' | 'system';
    description: string;
}
export declare const TWENTY_OBJECTS: TwentyObject[];
