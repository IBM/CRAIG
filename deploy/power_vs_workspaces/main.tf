
##############################################################################
# IBM Cloud Provider
##############################################################################

provider "ibm" {
  ibmcloud_api_key = var.ibmcloud_api_key
  region           = var.region
  ibmcloud_timeout = 60
}

##############################################################################

##############################################################################
# Resource Groups
##############################################################################

resource "ibm_resource_group" "craig_rg" {
  count = var.use_existing_rg ? 0 : 1
  name  = var.resource_group
  tags  = ["craig"]
}

data "ibm_resource_group" "existing_rg" {
  count = var.use_existing_rg ? 1 : 0
  name  = var.resource_group
}

locals {
  rg_id = var.use_existing_rg ? data.ibm_resource_group.existing_rg[0].id : ibm_resource_group.craig_rg[0].id
}
##############################################################################


##############################################################################
# Power VS Workspace Craig Wdc 07
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_wdc07" {
  name              = "${var.prefix}-power-workspace-craig-wdc07"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "wdc07"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Tor 01
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_tor01" {
  name              = "${var.prefix}-power-workspace-craig-tor01"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "tor01"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Sao 01
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_sao01" {
  name              = "${var.prefix}-power-workspace-craig-sao01"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "sao01"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Sao 04
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_sao04" {
  name              = "${var.prefix}-power-workspace-craig-sao04"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "sao04"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Tok 04
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_tok04" {
  name              = "${var.prefix}-power-workspace-craig-tok04"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "tok04"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Dal 12
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_dal12" {
  name              = "${var.prefix}-power-workspace-craig-dal12"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "dal12"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Dal 10
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_dal10" {
  name              = "${var.prefix}-power-workspace-craig-dal10"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "dal10"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Us South
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_us_south" {
  name              = "${var.prefix}-power-workspace-craig-us-south"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "us-south"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Wdc 06
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_wdc06" {
  name              = "${var.prefix}-power-workspace-craig-wdc06"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "wdc06"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Us East
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_us_east" {
  name              = "${var.prefix}-power-workspace-craig-us-east"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "us-east"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Lon 06
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_lon06" {
  name              = "${var.prefix}-power-workspace-craig-lon06"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "lon06"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Lon 04
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_lon04" {
  name              = "${var.prefix}-power-workspace-craig-lon04"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "lon04"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Eu De 2
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_eu_de_2" {
  name              = "${var.prefix}-power-workspace-craig-eu-de-2"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "eu-de-2"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Eu De 1
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_eu_de_1" {
  name              = "${var.prefix}-power-workspace-craig-eu-de-1"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "eu-de-1"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Mad 02
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_mad02" {
  name              = "${var.prefix}-power-workspace-craig-mad02"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "mad02"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Mad 04
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_mad04" {
  name              = "${var.prefix}-power-workspace-craig-mad04"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "mad04"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Syd 05
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_syd05" {
  name              = "${var.prefix}-power-workspace-craig-syd05"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "syd05"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################

##############################################################################
# Power VS Workspace Craig Syd 04
##############################################################################

resource "ibm_resource_instance" "power_vs_workspace_craig_syd04" {
  name              = "${var.prefix}-power-workspace-craig-syd04"
  service           = "power-iaas"
  plan              = "power-virtual-server-group"
  location          = "syd04"
  resource_group_id = local.rg_id
  tags              = ["craig"]
  timeouts {
    create = "6m"
    update = "5m"
    delete = "10m"
  }
}

##############################################################################