import { FC } from 'react';

import AsideHeader from './aside-header.component';
import ContactList from 'components/shared/contact-list.component';

const Aside: FC = () => {
  return (
    <aside className="aside">
      <AsideHeader />
      <ContactList />
    </aside>
  );
};

export default Aside;
