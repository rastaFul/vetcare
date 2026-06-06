import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: '#1a1a1a' },
  header: {
    borderBottom: '2 solid #2563EB',
    paddingBottom: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2563EB', marginBottom: 4 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
    borderBottom: '1 solid #e2e8f0',
    paddingBottom: 4,
    marginBottom: 8,
  },
  section: { marginBottom: 14 },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { fontWeight: 'bold', width: 100, color: '#374151' },
  value: { flex: 1 },
  itemBox: { border: '1 solid #e2e8f0', borderRadius: 4, padding: 8, marginBottom: 6 },
  itemMed: { fontSize: 12, fontWeight: 'bold', marginBottom: 3 },
  itemDetail: { fontSize: 10, color: '#374151', marginBottom: 2 },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  signatureBox: { textAlign: 'center', width: 200 },
  signatureLine: { borderBottom: '1 solid #1a1a1a', marginBottom: 4, height: 40 },
  signatureLabel: { fontSize: 9, color: '#64748B' },
})

interface Props {
  prescription: {
    diagnosis: string
    observations?: string
    items: Array<{
      medication: string
      dosage: string
      frequency: string
      duration: string
      instructions?: string
    }>
  }
  veterinarianName: string
  veterinarianCrmv?: string
  animalName: string
  tutorName: string
  consultationDate: Date
}

export function PrescriptionDocument({
  prescription,
  veterinarianName,
  veterinarianCrmv,
  animalName,
  tutorName,
  consultationDate,
}: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>VetCare</Text>
            <Text style={{ fontSize: 11, color: '#64748B' }}>Receituário Veterinário</Text>
          </View>
          <View>
            <Text style={{ fontSize: 10, color: '#64748B' }}>
              {consultationDate.toLocaleDateString('pt-BR')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paciente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Animal:</Text>
            <Text style={styles.value}>{animalName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Tutor:</Text>
            <Text style={styles.value}>{tutorName}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnóstico</Text>
          <Text>{prescription.diagnosis}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prescrição</Text>
          {prescription.items.map((item, idx) => (
            <View key={idx} style={styles.itemBox}>
              <Text style={styles.itemMed}>
                {idx + 1}. {item.medication}
              </Text>
              <Text style={styles.itemDetail}>Dose: {item.dosage}</Text>
              <Text style={styles.itemDetail}>Frequência: {item.frequency}</Text>
              <Text style={styles.itemDetail}>Duração: {item.duration}</Text>
              {item.instructions && (
                <Text style={styles.itemDetail}>Instruções: {item.instructions}</Text>
              )}
            </View>
          ))}
        </View>

        {prescription.observations && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observações</Text>
            <Text style={{ fontSize: 10, color: '#4B5563', fontStyle: 'italic' }}>
              {prescription.observations}
            </Text>
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>{veterinarianName}</Text>
            {veterinarianCrmv && (
              <Text style={styles.signatureLabel}>CRMV: {veterinarianCrmv}</Text>
            )}
          </View>
          <Text style={{ fontSize: 9, color: '#64748B' }}>
            Emitido em {new Date().toLocaleDateString('pt-BR')}
          </Text>
        </View>
      </Page>
    </Document>
  )
}
