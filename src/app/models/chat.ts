export type ChatLine = ChatLineObject | string;

export interface ChatLineObject {
  name?: string;
  color?: string;
  message: string;
  badges?: Badge[];
}

export interface Badge {
  title: string;
  version: string;
}

export interface Badges {
  badge_sets: {
    [key: string]: {
      versions: {
        [key: string]: {
          image_url_1x: string;
          image_url_2x: string;
          image_url_4x: string;
          description: string;
          title: string;
          click_action: 'visit_url' | 'subscribe_to_channel' | 'none';
          click_url: string;
        };
      };
    };
  };
}

export interface ChatUser {
  'display-name': string;
  color: string;
  subscriber: string;
  badges: Badge[];
  'user-id': string;
}
