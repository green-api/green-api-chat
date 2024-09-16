import { FC } from 'react';

import AsideFooter from './aside-footer.component';
import AsideHeader from './aside-header.component';
import InstanceInfo from './instance-info.component';
import ContactList from 'components/shared/contact-list.component';

const Aside: FC = () => {
  return (
    <aside className="aside">
      <AsideHeader />
      <InstanceInfo />
      <ContactList />
      <AsideFooter />
    </aside>
  );
};

export default Aside;
