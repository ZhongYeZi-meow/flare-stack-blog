export interface AboutPageProps {
  author: string;
  description: string;
  social: Array<{
    platform: string;
    url: string;
    icon?: string;
    label?: string;
  }>;
  sections: Array<{
    title: string;
    content: string;
  }>;
}
