import React, {  useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import Collapse from '@material-ui/core/Collapse';

const useStyles = makeStyles((theme) => ({   
    head: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      paddingBottom: 0,
    }  
  }));
  

const ListCollapse = (props) => {
    const [open, setOpen] = useState(true);
    const classes = useStyles();

    const handleClick = () => {
        setOpen(!open);
    };
    return (<div>
        <ListItem button onClick={handleClick} className={classes.head}>
            <ListItemIcon>
                {open ? <RemoveIcon /> : <AddIcon />}
            </ListItemIcon>
            <ListItemText primary={props.name} />
            {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={open} timeout="auto" unmountOnExit>
            {props.children}
        </Collapse>
    </div>)
};

export default ListCollapse ;