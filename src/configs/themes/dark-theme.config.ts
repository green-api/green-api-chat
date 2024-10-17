import { ThemeConfig } from 'antd';

export const DARK_THEME: ThemeConfig = {
  token: {
    colorBgBase: '#181a1b',
    colorBgContainer: '#181a1b',
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
      colorBgBase: '#4b4b4b',
      colorBgContainerDisabled: '#4b4b4b',
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
    Input: {
      colorErrorHover: '#ff4d4f',
      colorErrorBorderHover: '#ff4d4f',
      colorErrorOutline: '#ff4d4f',
    },
  },
};
