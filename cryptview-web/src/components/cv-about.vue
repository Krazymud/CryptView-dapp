<template>
    <div>
        <cv-banner/>
        <b-modal id="donateModal"
                ref="donateModal"
                @ok.prevent="handleDonate">
                <b-form-group horizontal
                            label="Ether(wei):"
                            label-class="text-sm-right"
                            class="mb-0">
                <b-form-input v-model="donate"></b-form-input>
            </b-form-group>
            <b-alert :show="dismissCountdown"
                dismissible
                variant="warning"
                @dismissed="dismissCountdown=0"
                @dismiss-count-down="countdownChanged">
                <p>{{errorMessage}}</p>
                <b-progress variant="warning"
                            :max="dismissSecs"
                            :value="dismissCountdown"
                            height="4px">
                </b-progress>
            </b-alert>
        </b-modal>
        <div class="card">
            <b-card title="About this app">
                <p class="card-text">
                    CryptView is for sharing and learning...
                </p>
                <p class="card-text">
                    It's bulit with the help of <a href="http://ethershare.org">EtherShare</a>
                </p>
                <b-button v-b-modal.donateModal>donate</b-button>
            </b-card>
        </div>
    </div>
</template>

<script>
import CryptViewBanner from '@/components/cv-banner'
export default {
    data () {
        return {
            donate: 0,
            dismissSecs: 4,
            dismissCountdown: 0,
            errorMessage: ''
        }
    },
    components: {
        'cv-banner': CryptViewBanner
    },
    methods: {
        showAlert (msg) {
            this.dismissCountdown = this.dismissSecs
            this.errorMessage = msg
        },
        countdownChanged (newCountdown) {
            this.dismissCountdown = newCountdown
        },
        handleDonate () {
            console.log(this.donate)
            if (this.donate === 0) {
                this.showAlert('No ether!')
            } else {
                this.$refs.donateModal.hide()
            }
        }
    }
}
</script>

<style scoped>

.card {
    width: 800px;
    margin: 0 auto;
}

</style>
