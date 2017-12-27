import React from 'react';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import Table, { TableCell, TableHead, TableBody, TableRow } from 'material-ui/Table';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Paper from 'material-ui/Paper';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import Input from 'material-ui/Input';
import InputField from 'components/Form/input-field';
import SelectField from 'components/Form/select-field';
import validatorjs from 'validatorjs';
import { observer, inject } from 'mobx-react';
import MobxReactForm from 'mobx-react-form';
import styles from './style.module.css';
import { graphql, compose, withApollo } from 'react-apollo';
import gql from 'graphql-tag';


@inject("store") @observer

@graphql(gql`
query Project($slug: String, $environmentId: String){
  project(slug: $slug, environmentId: $environmentId) {
    id
    services {
      id
      name
      command
      serviceSpec {
        id
        name
      }
      count
      type
      containerPorts {
        port
        protocol
      }
      created
    }
  }

}`,{
  options: (props) => ({
    variables: {
      slug: props.match.params.slug,
      environmentId: props.store.app.currentEnvironment.id,
    }
  })
})

export default class LoadBalancer extends React.Component {
    
  constructor(props){
    super(props)
    this.state = {}
  }

  componentWillMount(){
    this.setupForm()
  }

  setupForm(){
    const fields = [
        'service',
        'subdomain',
        'access',
        'portMaps',
        'portMaps[].port',
        'portMaps[].containerPort',
        'portMaps[].serviceProtocol',
    ]
    const rules = {}
    const labels = {
        'service': 'SERVICE',
        'subdomain': 'SUBDOMAIN',
        'access': 'ACCESS',
        'portMaps': 'PORT MAPS',
        'portMaps[].port': 'PORT',
        'portMaps[].containerPort': 'CONTAINER PORT',
        'portMaps[].serviceProtocol': 'SERVICE PROTOCOL',
    }
    const initials = {}
    const types = {}
    const extra = {
        'access': [{
            'key': 'internal',
            'value': 'Internal'
        }, {
            'key': 'external',
            'value': 'External'
        }, {
            'key': 'office',
            'value': 'Office'
        }],
        'portMaps[].serviceProtocol': [{
            'key': 'http',
            'value': 'HTTP'
        }, {
            'key': 'https',
            'value': 'HTTPS'
        }, {
            'key': 'ssl',
            'value': 'SSL'
        }, {
            'key': 'tcp',
            'value': 'TCP'
        }, {
            'key': 'udp',
            'value': 'UDP'
        }]
    }
    const hooks = {
        onChange(instance){
            console.log(instance.values())
        }        
    }
    const plugins = { dvr: validatorjs }
    this.form = new MobxReactForm({ fields, rules, labels, initials, types, extra, hooks, plugins })
  }
  
  onAdd(){
  }

  render(){
    console.log(this.form.values())
    const { viewType, onCancel } = this.props;
    const { loading, project } = this.props.data;

    if(loading){
      return (<div>Loading...</div>)
    }

    const extraOptions = project.services.map(function(service){
        return {
          key: service.id,
          value: service.name,
        }
      })
      this.form.state.extra({
        service: extraOptions,
      })

    let view = (<div></div>);
    
    if(viewType === "edit"){
      view = (
        <div>
            <form onSubmit={(e) => e.preventDefault()}>
                <Grid container spacing={24}>
                    <Grid item xs={6}>
                        <SelectField field={this.form.$('service')} extraKey={'service'} />
                    </Grid>
                    <Grid item xs={6}>
                        <InputField field={this.form.$('subdomain')} />
                    </Grid>        
                    <Grid item xs={12}>
                        <SelectField field={this.form.$('access')} />
                    </Grid>        
                </Grid>
                {this.form.$('service').value !== "" &&
                    <Grid container spacing={24}>
                        <Grid item xs={6}>
                            <InputField field={this.form.$('portMaps[].port')} />
                        </Grid>
                        <Grid item xs={6}>
                            <InputField field={this.form.$('portMaps[].port')} />
                        </Grid>        
                        <Grid item xs={12}>
                            <SelectField field={this.form.$('portMaps[].serviceProtocol')} />
                        </Grid>        
                    </Grid>
                }
            </form>
              <Grid item xs={12}>
                <Button raised color="primary" className={styles.rightPad}
                    onClick={this.onAdd.bind(this)}
                    disabled={this.state.addButtonDisabled}
                >
                    Save
                </Button>
                <Button color="primary"
                    className={styles.paddingLeft}
                    onClick={onCancel}
                >
                    Cancel
                </Button>
            </Grid>          
        </div>
      )
    }
    return view
  }

}