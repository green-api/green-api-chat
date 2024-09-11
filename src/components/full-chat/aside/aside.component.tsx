import { FC } from 'react';

import AsideFooter from './aside-footer.component';
import AsideHeader from './aside-header.component';
import ContactList from 'components/shared/contact-list.component';

const Aside: FC = () => {
  return (
    <aside className="aside">
      <AsideHeader />
      <ContactList />
      <AsideFooter />
    </aside>
  );
};

export default Aside;
