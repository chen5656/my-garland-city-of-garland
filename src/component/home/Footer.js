import React from 'react';

export default function Footer() {
  return (
    <footer className={'p-2'} style={{
      color: '#4e4e4e', background: 'rgb(202 200 200)'
    }}>
      <p style={{ fontStyle: 'italic', lineHeight: '1.42857', fontSize: '14px' }} mb={2}> Copyright 2021. City of Garland. </p>
      <p style={{ 'fontSize': '70%', 'lineHeight': '1.4' }}>Texas Government Code § 2051.102 (2011): This product is for informational purposes
      and may not have been prepared for
      or be suitable for legal, engineering, or surveying purposes. It does not represent an on-the-ground survey and
      represents
      only the approximate relative location of property boundaries.</p>
    </footer>
  );
}

