export interface CardConfig {
  title: string;
  body: string;
  timestamp: string;
}

// Default config used when no matching user is found
const defaultConfig: CardConfig = {
  title: "Happy Birthday!",
  body: "願你眼裏有光，心中有愛，一歲有一歲的芬芳。願璀璨星河皆為你閃爍，吹滅蠟燭的那一刻，所有的溫柔與美好都將如期而至。生日快樂！",
  timestamp: "2026.06.09 / 06:58 GMT+8",
};

// User-specific card configurations keyed by name
const cardConfigs: Record<string, CardConfig> = {
  "親愛的壽星": {
    title: "生日快樂，主恩滿溢！",
    body: "願主賜福於你，在新的一歲裡，恩典滿滿，每日都有與主同行的美好。願你心中有平安，生活有喜樂，每一天都充滿神的愛與祝福。",
    timestamp: "2026.06.09 / 06:58 GMT+8",
  },
  "阿傑": {
    title: "阿傑，生日快樂！",
    body: "願你在新的一歲裡事業蒸蒸日上，家人健康平安，朋友常伴左右。每一天都精彩萬分，每一刻都值得紀念。生日快樂！",
    timestamp: "2026.06.09 / 08:00 GMT+8",
  },
  "小雅": {
    title: "小雅，Happy Birthday!",
    body: "願你的笑容永遠如花般綻放，願你的夢想一個一個實現。你是世界上最獨特的存在，願這特別的一天帶給你無限的驚喜與幸福。",
    timestamp: "2026.06.09 / 12:00 GMT+8",
  },
};

export function getCardConfig(name: string): CardConfig {
  return cardConfigs[name] || defaultConfig;
}