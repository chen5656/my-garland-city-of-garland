import React, { useState, useEffect, useRef } from 'react';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const containerStyle = {
  margin: '2px',
  padding: '50px 5px 50px 5px',
  background: '#fcfbfa',
}
const cardStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    marginBottom: 12,
  },
});

export default function SuggestAddresses(props) {


  const classes = cardStyles();
  return (
        <Grid style={containerStyle}
          direction='row' justify='center'  >
          <Grid item lg={4} md={8} sm={12} alignItems='stretch' direction='column' justify='center'  >
            <Card className={classes.root}>
              <CardContent className='card-body '>
                <Typography className={classes.title} color='colorTextPrimary' variant='h4' >
                  Address not found.
                </Typography>
                <Typography id='address-links'>
                  {props.items && props.items.map()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

  );
}

