<template>
    <div class="body">
        <hello-metamask v-if="ifDebug"/>
        <cv-banner/>
        <cv-component/>
    </div>
</template>

<script>
import CryptViewBanner from '@/components/cv-banner'
import HelloMetamask from '@/components/hello-metamask'
import CryptviewComponent from '@/components/cv-component'
export default {
    name: 'cryptview-dapp',
    data: function () {
        return {
            ifDebug: false
        }
    },
    beforeCreate () {
        console.log('registerWeb3 Action dispatched from cryptview.vue')
        this.$store.dispatch('registerWeb3')
    },
    components: {
        'hello-metamask': HelloMetamask,
        'cv-component': CryptviewComponent,
        'cv-banner': CryptViewBanner
    },
    mounted () {
        console.log('dispatching getContractInstance')
        this.$store.dispatch('getContractInstance')
    }
}
</script>

<style scoped>

.body {
    background-color: rgb(230, 236, 240);
}

</style>
