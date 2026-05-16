export interface AboutPageProps {
  author: string;
  description: string;
  subtitle?: string;
  social: Array<{
    platform: string;
    url: string;
    icon?: string;
    label?: string;
    hidden?: boolean;
  }>;
  sections: Array<{
    title: string;
    content: string;
  }>;
}
