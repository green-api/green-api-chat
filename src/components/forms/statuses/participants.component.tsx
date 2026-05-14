import { Form } from 'antd';

import ParticipantsPopover from './participants-popover.component';

const Participants = () => {
  return (
    <Form.Item style={{ margin: 0 }}>
      <ParticipantsPopover />
    </Form.Item>
  );
};

export default Participants;
