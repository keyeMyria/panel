import React from 'react';
import { Route, Switch, Redirect } from "react-router-dom";
import { observer, inject } from 'mobx-react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import styles from './style.module.css';
import io from 'socket.io-client';
import Grid from 'material-ui/Grid';
import Snackbar from 'material-ui/Snackbar';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';

//components
import LeftNav from 'components/LeftNav';
import TopNav from 'components/TopNav';
import Dashboard from 'components/Dashboard';
import Create from 'components/Create';
import Project from 'components/Project';
import Admin from 'components/Admin';

const socket = io('http://localhost:3011');

@graphql(gql`
  query {
    user {
      id
      email
    }
    projects {
      id
      name
      slug
    }
  }
`)

@inject("store") @observer

export default class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      redirectToLogin: false,
      snackbar: {
        open: false,
        lastCreated: null,
      },
      drawer: {
        open: false,
        component: null,
      },
      fetchDelay: null,
    };
  }

  componentDidMount() {
    socket.on('reconnect_failed', () => {
        console.log('reconnect_failed')
    });

    socket.on('reconnect', () => {
        this.props.data.refetch()
        this.props.store.app.setConnectionHeader({ msg: "", type: "SUCCESS" })
    });

    socket.on('reconnecting', () => {
        this.props.store.app.setConnectionHeader({ msg: "Attempting to reconnect to server...", type: "FAIL" })
    });

    socket.on('projects', (data) => {
      this.props.data.refetch();
    });
  }

  handleRequestClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    this.setState({ snackbar: { open: false, lastCreated: this.state.snackbar.lastCreated } });
  };

  render() {
    let { loading, error, projects, user } = this.props.data;

    if(this.props.store.app.snackbar.created !== this.state.snackbar.lastCreated){
      this.state.snackbar.open = true;
      this.state.snackbar.lastCreated = this.props.store.app.snackbar.created;
    }

    if (loading) {
      return <div>Loading...</div>;
    } else if (this.state.redirectToLogin) {
      return <Redirect to={{pathname: '/login', state: { from: this.props.location }}}/>
    } else {
      return (
        <div className={styles.root}>
          <Grid container spacing={0}>
            <Grid item xs={12} className={styles.top}>
              <TopNav projects={projects} user={user} {...this.props} />
            </Grid>
            <Grid item xs={12} className={styles.center}>
              <LeftNav />
              <div className={styles.children}>
                <Switch>
                  <Route exact path='/' render={(props) => (
                    <Dashboard projects={projects} />
                  )} />
                  <Route exact path='/create' render={(props) => (
                    <Create projects={projects} type={"create"} {...props} />
                  )} />
                  <Route path='/admin' render={(props) => (
                    <Admin data={this.props.data} projects={projects} socket={socket} {...props} />
                  )} />
                  <Route path='/projects/:slug' render={(props) => (
                    <Project socket={socket} user={user} {...props} />
                  )} />
                </Switch>
              </div>
            </Grid>
          </Grid>

          <Snackbar
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            open={this.state.snackbar.open}
            autoHideDuration={6000}
            onRequestClose={this.handleRequestClose}
            SnackbarContentProps={{
              'aria-describedby': 'message-id',
            }}
            message={<span id="message-id">{this.props.store.app.snackbar.msg}</span>}
            action={[
              <IconButton key="close" aria-label="Close" color="inherit" onClick={this.handleRequestClose}>
                <CloseIcon />
              </IconButton>,
            ]}
          />
        </div>
      );
    }
  }
}
