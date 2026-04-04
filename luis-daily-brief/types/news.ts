export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface Story {
  title: string;
  summary: string;
  why_it_matters: string;
  sentiment: Sentiment;
  source: string;
  url: string;
  read_time_seconds: number;
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  stories: Story[];
}

export interface NewsBrief {
  generated_at: string;
  categories: Category[];
}

export type FetchStatus = 'idle' | 'loading' | 'success' | 'error';
