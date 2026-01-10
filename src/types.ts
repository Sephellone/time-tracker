export interface NavigationItem {
  name: string;
  text: string;
  to?: string;
  onClick?: () => void;
  iconComponent?: any;
}
