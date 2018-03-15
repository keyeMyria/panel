import React from 'react';
import { observer, inject } from 'mobx-react';
import styles from './style.module.css';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import Grid from 'material-ui/Grid';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import validatorjs from 'validatorjs';
import MobxReactForm from 'mobx-react-form';
import InputField from 'components/Form/input-field';
import CreateProject from '../../Create';
import Card, {CardContent, CardActions} from 'material-ui/Card';

@inject("store") @observer

@graphql(gql`
  query Project($slug: String, $environmentID: String){
    project(slug: $slug, environmentID: $environmentID) {
      id
      name
      slug
      repository
      gitUrl
      gitProtocol
      gitBranch
    }
  }`, {
  options: (props) => ({
    variables: {
      slug: props.match.params.slug,
      environmentID: props.store.app.currentEnvironment.id,
    }
  })
})

@graphql(gql`
  mutation Mutation($id: String!, $gitProtocol: String!, $gitUrl: String!,  $environmentID: String!, $gitBranch: String) {
    updateProject(project: { id: $id, gitProtocol: $gitProtocol, gitUrl: $gitUrl, environmentID: $environmentID, gitBranch: $gitBranch}) {
      id
      name
      slug
      repository
      gitUrl
      gitBranch
      gitProtocol
    }
  }
`, { name: "updateProject"})

export default class Settings extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      settingsSet: false
    }
  }

  createProjectForm(){
    const fields = [
      'id',
      'gitProtocol',
      'gitUrl',
      'environmentID',
      'gitBranch',
    ];
    const rules = {};
    const labels = {
      'gitBranch': 'Git Branch',
    };
    const initials = {
    };
    const types = {};
    const extra = {};
    const hooks = {};
    const handlers = {};
    const plugins = { dvr: validatorjs };
    this.form = new MobxReactForm({ fields, rules, labels, initials, extra, hooks, types }, { handlers }, { plugins })    
  }

  componentWillMount(){
    this.createProjectForm()
  }

  updateProject(form){
    this.props.updateProject({
      variables: form.values(),
    }).then(({data}) => {
      this.props.data.refetch()
    });
  }

  updateSettings(form){
    this.props.updateProject({
      variables: form.values(),
    }).then(({data}) => {
      this.props.data.refetch()
    });    
  }

  onError(form){
    console.log('onError')
  }

  onUpdateSettings(e){
    this.form.onSubmit(e, { onSuccess: this.updateSettings.bind(this), onError: this.onError.bind(this) })
  }

  setFormValues(){
    if(!this.props.data.loading){
      const { project } = this.props.data;
      const { currentEnvironment } = this.props.store.app;

      this.form.$('id').set(project.id)
      this.form.$('gitProtocol').set(project.gitProtocol)
      this.form.$('gitUrl').set(project.gitUrl)
      this.form.$('environmentID').set(currentEnvironment.id)
      this.form.$('gitBranch').set(project.gitBranch)      
      this.setState({ settingsSet: true })
    }
  }

  componentWillUpdate(nextProps, nextState){

  } 

  render() {
    const { loading, project } = this.props.data;

    if(loading){
      return (<div>Loading</div>)
    }
    if(!this.state.settingsSet){
      this.setFormValues()
    }

    return (
      <div className={styles.root}>
        <Grid container spacing={24}> 
          <Grid item sm={3}>
            <Typography variant="title" className={styles.settingsDescription}>
              Repository Settings
            </Typography>
            <Typography variant="caption" className={styles.settingsCaption}>
              You can update your project settings to point to a different url
              or make appropriate cascading modifications (e.g. if your project became private).
            </Typography>
          </Grid>

          <Grid item sm={9}>
            <Grid xs={12}>
              <CreateProject 
                title=""
                type={"save"}
                project={project}
                loadLeftNavBar={false} />
            </Grid>
          </Grid>  
          <Grid item sm={3}>
            <Typography variant="title" className={styles.settingsDescription}>
              Branch Settings
            </Typography>
            <Typography variant="caption" className={styles.settingsCaption}>
              Updating your branch will update the Features page to show commits from the
              chosen branch. Make sure the selected branch exists.
            </Typography>
          </Grid>
          <Grid item sm={9}>
            <Card className={styles.card}>
              <CardContent>
                <Grid xs={12}>
                  <InputField field={this.form.$('gitBranch')} fullWidth={true} />            
                </Grid>
              </CardContent>
              <CardActions>
                <Button color="primary"
                  type="submit"
                  variant="raised"
                  onClick={(e) => this.onUpdateSettings(e)}>
                  Save
                </Button>
              </CardActions>
            </Card>
          </Grid>                   
          <Grid item xs={3}>
          </Grid>
          <Grid item xs={9}>
          </Grid>
        </Grid>
      </div>
    );
  }
}
