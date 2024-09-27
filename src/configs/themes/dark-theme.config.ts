import { ThemeConfig } from 'antd';

export const DARK_THEME: ThemeConfig = {
  token: {
    colorBgBase: '#0e0e0e',
    colorBgContainer: '#0e0e0e',
    colorLink: '#fff',
    colorLinkHover: 'var(--link-hover-color)',
    colorBgElevated: 'var(--main-background)',
    colorBorder: '#313131',
    colorBorderSecondary: 'var(--border-color)',
    colorPrimary: '#009805',
    colorPrimaryBg: '#3a4136',
    colorText: '#fff',
    colorInfoText: '#fff',
    colorTextBase: '#fff',
    colorBgSpotlight: '#424242',
  },
  components: {
    Progress: {
      colorInfo: '#009805',
    },
    Tooltip: {
      colorBgBase: '#000',
      colorBgContainerDisabled: '#000',
      colorText: '#fff',
    },
    Layout: {
      colorBgLayout: 'var(--main-background)',
    },
    Tabs: {
      margin: 0,
      colorBorderSecondary: 'var(--second-background)',
    },
    Button: {
      colorPrimaryHover: '#009805',
      colorPrimaryActive: '#009805',
    },
    Switch: {
      colorPrimary: '#009805',
      colorPrimaryHover: '#009805',
    },
    Spin: {
      colorPrimary: '#009805',
    },
  },
};
