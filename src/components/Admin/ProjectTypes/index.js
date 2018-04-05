import React from 'react';
import Toolbar from 'material-ui/Toolbar';
import Paper from 'material-ui/Paper';
import Typography from 'material-ui/Typography';

import styles from './style.module.css';

export default class Secrets extends React.Component {
    constructor(props){
      super(props)
      this.state = {
        addEnvVarMenuOpen: false,
        saving: false,
        drawerOpen: false,
        dialogOpen:false,
      }
    }

    render() {
        return (
            <div>
                <Paper className={styles.tablePaper}>
                    <Toolbar>
                    <div>
                        <Typography variant="title">
                            Project Types
                        </Typography>
                    </div>
                    </Toolbar>
                </Paper>
            </div>
        )
    }
}
  