<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonCard,
  IonItem,
  IonLabel,
  IonInput,
  IonModal,
  IonHeader,
  IonToolbar,
  IonSearchbar,
  IonButton,
  IonAvatar,
  IonImg,
  IonList,
} from "@ionic/vue";
import { ref, onMounted } from "vue";
import currencies from "../currencies.json"

type EventSource = 1 | 2 | null

const exchangeRateData = ref()
const primaryCurrency = ref("USD")
const secondaryCurrency = ref("EUR")
const primaryInput = ref(0)
const secondaryInput = ref(0)
const isOpen = ref(false)
const eventSourceIndex = ref(null as EventSource)
const searchedCurrency = ref("")
const internetConnectionIssue = ref(false)
const apiKey = ""
let baseCode = "USD"

const openModalFrom = (e: EventSource) => {
  eventSourceIndex.value = e
  isOpen.value = true
}
const closeModal = () => isOpen.value = false

const selectCurrency = (code: string) => {
  if (eventSourceIndex.value == 1)
    primaryCurrency.value = code
  else
    secondaryCurrency.value = code
  convert(primaryCurrency.value, secondaryCurrency.value)
  closeModal()
}

const getExchangeRate = () =>
  fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/${baseCode}`)
    .then(data => data.json())
    .then(json => {
      exchangeRateData.value = json
      internetConnectionIssue.value = false
    })
    .catch(err => {
      internetConnectionIssue.value = true
      primaryInput.value = 0
      secondaryInput.value = 0
    })

const getNum = (val: any) => +val || 0

const convert = async (source: string, target: string) => {
  if (baseCode != source && baseCode != target) {
    baseCode = primaryCurrency.value
    await getExchangeRate()
  }
  if (source == baseCode)
    secondaryInput.value = getNum(primaryInput.value) * exchangeRateData.value?.conversion_rates[target]
  else
    primaryInput.value = getNum(secondaryInput.value) / exchangeRateData.value?.conversion_rates[source]
}

onMounted(async () => await getExchangeRate())
</script>

<template>
  <ion-page>
    <ion-content>

      <h3 class="ion-padding ion-margin ion-text-center">Currency Converter</h3>
      <ion-card>
        <ion-item :detail="true" button @click="openModalFrom(1)">
          <ion-label>{{ currencies[primaryCurrency] }}</ion-label>
        </ion-item>
        <ion-item>
          <ion-input type="number" min="0" v-model="primaryInput" :clear-on-edit="primaryInput == 0"
          @ionInput="convert(primaryCurrency, secondaryCurrency)" :disabled="internetConnectionIssue"></ion-input>
        </ion-item>
      </ion-card>
      <ion-card>
        <ion-item :detail="true" button @click="openModalFrom(2)">
          <ion-label>{{ currencies[secondaryCurrency] }}</ion-label>
        </ion-item>
        <ion-item>
          <ion-input type="number" min="0" v-model="secondaryInput" :clear-on-edit="secondaryInput == 0"
          @ionInput="convert(secondaryCurrency, primaryCurrency)" :disabled="internetConnectionIssue"></ion-input>
        </ion-item>
      </ion-card>
      <ion-label>
        <p class="ion-padding ion-text-center">Updated on {{ exchangeRateData?.time_last_update_utc }} </p>
      </ion-label>

      <div v-if="internetConnectionIssue" class="ion-text-center">
        <h5>Cannot connect to the server!</h5>
        <ion-button fill="clear" color="success" @click="getExchangeRate()">Tap to Retry</ion-button>
      </div>

    </ion-content>

    <ion-modal :is-open="isOpen" :keep-contents-mounted="true">
      <ion-header>
        <ion-toolbar>
          <ion-searchbar placeholder="Search" v-model="searchedCurrency"></ion-searchbar>
          <ion-button slot="end" fill="clear" color="danger" @click="closeModal">Cancel</ion-button>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        <ion-list v-if="exchangeRateData">
          <div v-for="(currencyName, currencyCode) in currencies" :key="currencyCode">
            <ion-item v-if="currencyName.toLowerCase().includes(searchedCurrency.toLowerCase())"
            @click="selectCurrency(String(currencyCode))">
              <ion-avatar slot="start">
                <ion-img :src="`png100px/${currencyCode}.png`"></ion-img>
              </ion-avatar>
              <ion-label>
                <h2>{{ currencyName }}</h2>
                <p>{{ exchangeRateData.conversion_rates[currencyCode] }}</p>
              </ion-label>
            </ion-item>
          </div>
        </ion-list>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<style>
  ion-input {
    color: orangered !important;
    font-size: large !important;
    font-weight: bolder;
  }
</style>