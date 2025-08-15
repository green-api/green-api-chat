import { FC } from 'react';

import { Typography, Progress, Flex } from 'antd';

import { PollMessageData } from 'types';

interface Props {
  data: PollMessageData & { votes?: { optionName: string; optionVoters: string[] }[] };
  type: 'incoming' | 'outgoing';
  senderName: string;
  isMiniVersion: boolean;
}

const PollMessage: FC<Props> = ({ data }) => {
  const totalVotes = data.votes?.reduce((acc, v) => acc + v.optionVoters.length, 0) || 0;

  return (
    <div style={{ margin: '8px 0', width: 300, backgroundColor: 'transparent', border: 'none' }}>
      <Flex vertical gap={12}>
        <h4 style={{ marginBottom: 10, wordBreak: 'break-all' }}>{data.name}</h4>
        {data.options?.map((option, idx) => {
          const vote = data.votes?.find((v) => v.optionName === option.optionName);
          const count = vote?.optionVoters.length || 0;
          const percent = totalVotes ? (count / totalVotes) * 100 : 0;

          return (
            <div key={idx} style={{ marginBottom: 8 }}>
              <Typography.Text>{option.optionName}</Typography.Text>
              <Progress percent={Math.round(percent)} size="small" />
            </div>
          );
        })}
      </Flex>
    </div>
  );
};

export default PollMessage;
