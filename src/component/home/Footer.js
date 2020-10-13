import React from 'react';
import Box from '@material-ui/core/Box';

export default  function Footer() {
  
  return (
    <Box p={2} style={{ color: '#4e4e4e' }}>
      <Box component='p' style={{fontStyle:'italic',lineHeight:'1.42857',fontSize:'14px'}} mb={2}> Copyright 2021. City of Garland. </Box>
      <Box component='p' style={{'fontSize':'70%','lineHeight':'1.4'}}>Texas Government Code § 2051.102 (2011): This product is for informational purposes
      and may not have been prepared for
      or be suitable for legal, engineering, or surveying purposes. It does not represent an on-the-ground survey and
      represents
      only the approximate relative location of property boundaries.</Box>
    </Box>
  );
}

