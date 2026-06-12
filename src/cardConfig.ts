export interface CardConfig {
  title: string;
  body: string;
  timestamp: string;
  step2Title: string;
  step1Title: string;
}

// Default config used when no matching user is found
const defaultConfig: CardConfig = {
  title: "Happy Birthday!",
  body: "願你眼裏有光，心中有愛，一歲有一歲的芬芳。願璀璨星河皆為你閃爍，吹滅蠟燭的那一刻，所有的溫柔與美好都將如期而至。生日快樂！",
  timestamp: "2026年6月",
  step2Title: "生日快樂，平安喜樂！",
  step1Title: "Happy Birthday!",
};

// User-specific card configurations keyed by name
const cardConfigs: Record<string, CardConfig> = {
  "親愛的壽星": {
    title: "生日快樂，主恩滿溢！",
    body: "願主賜福於你，在新的一歲裡，恩典滿滿，每日都有與主同行的美好。願你心中有平安，生活有喜樂，每一天都充滿神的愛與祝福。",
    timestamp: "2026年6月",
    step2Title: "生日快樂，平安喜樂！",
    step1Title: "Happy Birthday!",
  },
  "kan": {
    title: "栢勤，生日快樂！",
    body: "每次見你都笑盈盈咁傾偈，\n你嘅微笑好有感染力。\n新的一歲，\n「願耶和華賜福給你，保護你！」\n民數記 6:24",
    timestamp: "2026年6月",
    step2Title: "栢勤，生日快樂🎂\n慢慢享用呢份蛋糕🍰",
    step1Title: "留低你嘅生日紀念",
  },
  "ping": {
    title: "阿平，生日快樂！",
    body: "願妳喺新嘅一歲，\n收穫更多溫暖、關愛。\n願主牽著妳嘅手，\n帶領妳走嘅每一步，\n每一步都有平安同恩典。\n「你的話是我腳前的燈，\n是我路上的光。」\n詩篇 119:105",
    timestamp: "2026年6月",
    step2Title: "阿平，生日快樂🎂\n慢慢享用呢份蛋糕🍰",
    step1Title: "留低妳嘅生日紀念",
  },
  "isaac": {
    title: "Isaac，生日快樂！",
    body: "新嘅一歲，平平安安地去收穫，\n做好自己想做嘅事業，\n願你喺事奉中、喺摺手工嘅熱愛中得力。\n新的一歲，\n「願耶和華賜福給你，保護你！」\n民數記 6:24",
    timestamp: "2026年6月",
    step2Title: "Isaac，生日快樂🎂\n慢慢享用呢份蛋糕🍰",
    step1Title: "留低你嘅生日紀念",
  },
  "jan": {
    title: "頌恩，生日快樂！",
    body: "願神看顧妳心中嘅每一個願望，\n引領妳前方嘅路！\n新的一歲，\n「願耶和華賜福給你，保護你！」\n民數記 6:24",
    timestamp: "2026年6月",
    step2Title: "頌恩，生日快樂🎂\n慢慢享用呢份蛋糕🍰",
    step1Title: "留低妳嘅生日紀念",
  },
  "阿傑": {
    title: "阿傑，生日快樂！",
    body: "願你在新的一歲裡事業蒸蒸日上，家人健康平安，朋友常伴左右。每一天都精彩萬分，每一刻都值得紀念。生日快樂！",
    timestamp: "2026年6月",
    step2Title: "阿傑，生日快樂🎂\n慢慢享用呢份蛋糕🍰",
    step1Title: "留低你嘅生日紀念",
  },
  "小雅": {
    title: "小雅，Happy Birthday!",
    body: "願你的笑容永遠如花般綻放，願你的夢想一個一個實現。你是世界上最獨特的存在，願這特別的一天帶給你無限的驚喜與幸福。",
    timestamp: "2026年6月",
    step2Title: "小雅，生日快樂🎂\n慢慢享用呢份蛋糕🍰",
    step1Title: "留低妳嘅生日紀念",
  },
};

export function getCardConfig(name: string): CardConfig {
  return cardConfigs[name] || defaultConfig;
}