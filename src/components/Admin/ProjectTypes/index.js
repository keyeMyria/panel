import React from 'react';
import Typography from 'material-ui/Typography';
import Grid from 'material-ui/Grid';
import Toolbar from 'material-ui/Toolbar';
import Button from 'material-ui/Button';
import Table, { TableCell, TableHead, TableBody, TableRow } from 'material-ui/Table';
import Paper from 'material-ui/Paper';
import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import AddIcon from 'material-ui-icons/Add';
import InputField from 'components/Form/input-field';
import CheckboxField from 'components/Form/checkbox-field';
import Loading from 'components/Utils/Loading';
import styles from './style.module.css';
import { observer } from 'mobx-react';
import validatorjs from 'validatorjs';
import MobxReactForm from 'mobx-react-form';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

const inlineStyles = {
  addButton: {
    position: 'absolute',
    bottom: 25,
    right: 25,
  }
}

@graphql(gql`
    query {
      projectTypes {
        id
        name
        key
        availableExtensions
      }
    }
`)

// @graphql(gql`
//   mutation CreateProjectType($name: String!, $key: String!,$isDefault: Boolean!, $color: String!) {
//       createProjectType(ProjectType:{
//         name: $name,
//         key: $key,
//         isDefault: $isDefault,
//         color: $color,
//       }) {
//           id
//           name
//       }
//   }
// `, { name: "createProjectType" })

// @graphql(gql`
// mutation UpdateProjectType($id: String!, $name: String!, $key: String!, $isDefault: Boolean!, $color: String!) {
//     updateProjectType(ProjectType:{
//     id: $id,
//     name: $name,
//     key: $key,
//     isDefault: $isDefault,
//     color: $color,
//     }) {
//         id
//         name
//     }
// }
// `, { name: "updateProjectType" })

// @graphql(gql`
// mutation DeleteProjectType ($id: String!, $name: String!, $key: String!, $isDefault: Boolean!, $color: String!) {
//     deleteProjectType(ProjectType:{
//     id: $id,
//     name: $name,
//     key: $key,
//     isDefault: $isDefault,
//     color: $color,
//     }) {
//         id
//         name
//     }
// }
// `, { name: "deleteProjectType" })

@observer
export default class ProjectTypes extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      saving: false,
      drawerOpen: false,
      dialogOpen: false,
    }
  }

  componentWillMount(){
    const initials = {}
    const fields = [
      'id',
      'name',
      'key',
      'availableExtensions',
      'availableExtensions[]',
      'availableExtensions[].extensionID',
      'availableExtensions[].isDefault',
    ];
    const rules = {
      'name': 'string|required',
    };
    const labels = {
      'name': 'Name',
      'key': 'Key',
      'availableExtensions': 'Available Extensions',
      'availableExtensions[].extensionID': 'Extension Key',
      'availableExtensions[].isDefault': 'Default (installed on creation)',
    };
    const types = {
      'availableExtensions[].isDefault': 'checkbox',
    };
    const keys = {
    };
    const disabled = {
      'availableExtensions[].extensionID': true,
    }
    const extra = {}
    const hooks = {};
    const placeholders = {
      'isDefault': 'Default envs are auto-added to a project on creation. Atleast 1 default is required at any time.',
    };
    const plugins = { dvr: validatorjs };

    this.form = new MobxReactForm({ fields, rules, disabled, labels, initials, extra, hooks, types, keys, placeholders }, { plugins });
  }

  onSubmit(e) {
    this.setState({ saving: true })
    this.form.onSubmit(e, { onSuccess: this.onSuccess.bind(this), onError: this.onError.bind(this) })
  }

  onError(form){
    this.setState({ saving: false })
  }

  onClick(projectTypeIdx){
    const { projectTypes } = this.props.data;

    this.form.clear()

    if(projectTypeIdx >= 0 && projectTypes.length >= projectTypeIdx){
      console.log(projectTypes[projectTypeIdx])
      this.form.$('name').set(projectTypes[projectTypeIdx].name)
      this.form.$('key').set(projectTypes[projectTypeIdx].key)
      this.form.$('availableExtensions').set(projectTypes[projectTypeIdx].availableExtensions)

      console.log(this.form.$('availableExtensions').value)

      this.openDrawer()
    }
  }

  onSuccess(form){
    if(form.values()['id'] !== ""){
      this.props.updateProjectType({
        variables: form.values(),
      }).then(({data}) => {
        this.closeDrawer()
        this.props.data.refetch()
      });
    } else {
      this.props.createProjectType({
        variables: form.values(),
      }).then(({data}) => {
        this.closeDrawer()
        this.props.data.refetch()
      });
    }
  }

  openDrawer(){
    this.setState({ drawerOpen: true, saving: false });
  }

  closeDrawer(){
    this.form.clear()
    this.form.$('key').set('disabled', false)
    this.setState({ drawerOpen: false, saving: false, dialogOpen: false })
  }

  handleDelete(){
    this.props.deleteProjectType({
      variables: this.form.values(),
    }).then(({data}) => {
      this.props.data.refetch()
      this.closeDrawer()
    });
  }

  render() {
    const { loading, projectTypes } = this.props.data;
    if(loading){
      return (
        <Loading />
      );
    }

    var self = this;

    return (
      <div>
        <Paper className={styles.tablePaper}>
          <Toolbar>
            <Typography variant="title">
              Project Types
            </Typography>
          </Toolbar>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  Name
                </TableCell>
                <TableCell>
                  Key
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projectTypes.map(function(projectType, idx){
                return (
                  <TableRow
                    hover
                    tabIndex={-1}
                    onClick={()=> self.onClick(idx)}
                    key={projectType.id}>
                    <TableCell>
                      {projectType.name}
                    </TableCell>
                    <TableCell>
                      {projectType.key}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Paper>

        <Button variant="fab" aria-label="Add" type="submit" color="primary"
            style={inlineStyles.addButton}
            onClick={this.openDrawer.bind(this)}>
            <AddIcon />
        </Button>

        <Drawer
            anchor="right"
            classes={{
              paper: styles.list,
            }}
            open={this.state.drawerOpen}
        >
            <div tabIndex={0} className={styles.createServiceBar}>
              <AppBar position="static" color="default">
                  <Toolbar>
                  <Typography variant="title" color="inherit">
                      Project Type
                  </Typography>
                  </Toolbar>
              </AppBar>
              <form>
                <div className={styles.drawerBody}>
                  <Grid container spacing={24} className={styles.grid}>
                    <Grid item xs={12}>
                      <InputField field={this.form.$('name')} fullWidth={true} />
                    </Grid>
                    <Grid item xs={12}>
                      <InputField field={this.form.$('key')} fullWidth={true} />
                    </Grid>
                    <Grid item xs={12}>
                      {this.form.$('availableExtensions').map(function(availableExtension){
                        return (
                          <Grid item xs={12}>
                            <Grid item xs={12}>
                              <InputField field={availableExtension.$('extensionID')} />
                            </Grid>
                            <Grid item xs={12}>
                              <CheckboxField field={availableExtension.$('isDefault')} />
                            </Grid>
                          </Grid>
                        )
                      })}
                    </Grid>
                    <Grid item xs={12}>
                      <Button color="primary"
                        className={styles.buttonSpacing}
                        disabled={this.state.saving}
                        type="submit"
                        variant="raised"
                        onClick={(e) => this.onSubmit(e)}>
                          Save
                      </Button>
                      {this.form.$('id').value !== "" &&
                        <Button
                          disabled={this.state.saving}
                          style={{ color: "red" }}
                          onClick={()=>this.setState({ dialogOpen: true })}>
                          Delete
                        </Button>
                      }
                      <Button
                        color="primary"
                        onClick={this.closeDrawer.bind(this)}>
                        Cancel
                      </Button>
                    </Grid>
                  </Grid>
                </div>
              </form>
            </div>
        </Drawer>

        <Dialog open={this.state.dialogOpen} onRequestClose={() => this.setState({ dialogOpen: false })}>
          <DialogTitle>{"Are you sure you want to delete " + this.form.values()['name'] + "?"}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {"This will delete the ProjectType " + this.form.values()['name'] + "."}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={()=>this.setState({ dialogOpen: false })} color="primary">
              Cancel
            </Button>
            <Button onClick={()=>this.handleDelete()} style={{ color: "red" }}>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }

}
