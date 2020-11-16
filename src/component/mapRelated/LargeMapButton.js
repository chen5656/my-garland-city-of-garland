import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Modal from '@material-ui/core/Modal';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';




function getModalStyle(smScreen) {
  if(smScreen){
    return {
      top: '0',
      left: '0',
      // transform: `translate(-${top}%, -${left}%)`,
      width: '100%',
      height: '100%',
    };
  }
  return {
    top: '5%',
    left: '5%',
    // transform: `translate(-${top}%, -${left}%)`,
    width: '85%',
    height: '85%',
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
  closeBtn: {
    position: 'absolute',
    zIndex: 102,
    right: '-15px',
    top: 0,
  }
}));

export default function SimpleModal(props) {
  const smScreen = (window.innerWidth<576);
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle(smScreen));
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const body = (
    <div style={modalStyle} className={classes.paper}>
      <Button onClick={handleClose} className={classes.closeBtn} >
        <CloseIcon />
      </Button>
      {/* <p id="simple-modal-description">
        
      </p> */}
      {props.body}
    </div>
  );
  return (
    <div >
      {smScreen ?
        <Button  size='small' variant='contained' color="primary" onClick={handleOpen} >
          <ZoomOutMapIcon />
        </Button>
        :
        <Button size='small' variant='contained' color="primary" onClick={handleOpen} title='Show Large Map'>
          Show Large
        </Button>
      }
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
          {body}
      </Modal>
    </div>
  );
}
