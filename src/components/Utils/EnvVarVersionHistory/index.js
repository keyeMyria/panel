import React from 'react';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Toolbar from 'material-ui/Toolbar';
import Table, { TableCell, TableHead, TableBody, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import styles from './style.module.css';
import { observer } from 'mobx-react';

@observer
export default class EnvVarVersionHistory extends React.Component {
  render() {
    const { onClickVersion, versions } = this.props

    return (
      <Grid item xs={12}>
        <Paper className={styles.root}>
          <div className={styles.tableWrapper}>
            <Toolbar>
              <div>
                <Typography type="title">
                  Version History
                </Typography>
              </div>
            </Toolbar>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>
                    Version
                  </TableCell>
                  <TableCell>
                    Creator
                  </TableCell>
                  <TableCell>
                    Created At
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
              {versions.map(function(envVar, idx){
                  return (
                    <TableRow
                      hover
                      tabIndex={-1}
                      onClick={() => onClickVersion(idx)}
                      key={envVar.id}>
                      <TableCell>
                        {versions.length - idx}
                      </TableCell>
                      <TableCell>
                        {envVar.user.email}
                      </TableCell>
                      <TableCell>
                        {new Date(envVar.created).toString()}
                      </TableCell>
                    </TableRow>
                  )
                })}                            
              </TableBody>
            </Table>
          </div>                        
        </Paper>
      </Grid>          
    )        
  }
}