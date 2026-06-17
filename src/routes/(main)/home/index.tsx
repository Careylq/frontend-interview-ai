import { Flexbox } from '@lobehub/ui';
import { type FC } from 'react';

import HomePageTracker from '@/components/Analytics/HomePageTracker';
import InterviewHome from '@/features/InterviewHome';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';

const Home: FC = () => {
  return (
    <>
      <HomePageTracker />
      <NavHeader />
      <Flexbox
        height={'100%'}
        style={{ overflowY: 'auto', paddingBlock: '44px 16vh' }}
        width={'100%'}
      >
        <WideScreenContainer>
          <InterviewHome />
        </WideScreenContainer>
      </Flexbox>
    </>
  );
};

export default Home;
