import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a standard serif font for that "LaTeX" look
Font.register({
    family: 'Times-Roman',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/timesnewroman/v12/TimesNewRomanPSMT.ttf' },
        { src: 'https://fonts.gstatic.com/s/timesnewroman/v12/TimesNewRomanPS-BoldMT.ttf', fontWeight: 'bold' },
        { src: 'https://fonts.gstatic.com/s/timesnewroman/v12/TimesNewRomanPS-ItalicMT.ttf', fontStyle: 'italic' },
    ],
});

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Times-Roman',
        fontSize: 11,
        lineHeight: 1.4,
        color: '#000',
    },
    header: {
        marginBottom: 20,
        textAlign: 'center',
    },
    name: {
        fontSize: 24,
        fontFamily: 'Times-Roman',
        fontWeight: 'bold',
        marginBottom: 5,
        textTransform: 'uppercase',
    },
    contact: {
        fontSize: 10,
        color: '#333',
        marginBottom: 5,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Times-Roman',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        borderBottomStyle: 'solid',
        marginBottom: 8,
        paddingBottom: 2,
        letterSpacing: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 2,
    },
    leftCol: {
        flex: 1,
    },
    rightCol: {
        textAlign: 'right',
    },
    bold: {
        fontFamily: 'Times-Roman',
        fontWeight: 'bold',
    },
    italic: {
        fontFamily: 'Times-Roman',
        fontStyle: 'italic',
    },
    text: {
        fontSize: 11,
        marginBottom: 2,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 2,
        paddingLeft: 10,
    },
    bullet: {
        width: 10,
        fontSize: 10,
    },
    bulletText: {
        flex: 1,
        fontSize: 11,
    },
    skillsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
});

interface ResumeData {
    personal: {
        name: string;
        email: string;
        phone: string;
        linkedin: string;
        github: string;
    };
    education: Array<{
        school: string;
        degree: string;
        year: string;
        cgpa: string;
    }>;
    experience: Array<{
        company: string;
        role: string;
        duration: string;
        description: string;
    }>;
    projects: Array<{
        name: string;
        tech: string;
        description: string;
        link: string;
    }>;
    skills: string[];
    customSections?: Array<{
        id: string;
        title: string;
        content: string;
    }>;
}

interface StandardTemplateProps {
    data: ResumeData;
}

const StandardTemplate: React.FC<StandardTemplateProps> = ({ data }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.name}>{data.personal.name || 'YOUR NAME'}</Text>
                    <Text style={styles.contact}>
                        {[
                            data.personal.email,
                            data.personal.phone,
                            data.personal.linkedin,
                            data.personal.github,
                        ].filter(Boolean).join('  |  ')}
                    </Text>
                </View>

                {/* Education */}
                {data.education.length > 0 && data.education[0].school && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Education</Text>
                        {data.education.map((edu, i) => (
                            <View key={i} style={{ marginBottom: 6 }}>
                                <View style={styles.row}>
                                    <Text style={styles.bold}>{edu.school}</Text>
                                    <Text style={styles.bold}>{edu.year}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={styles.italic}>
                                        {edu.degree} {edu.cgpa ? `(CGPA: ${edu.cgpa})` : ''}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Experience */}
                {data.experience.length > 0 && data.experience[0].company && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Experience</Text>
                        {data.experience.map((exp, i) => (
                            <View key={i} style={{ marginBottom: 10 }}>
                                <View style={styles.row}>
                                    <Text style={styles.bold}>{exp.company}</Text>
                                    <Text style={styles.bold}>{exp.duration}</Text>
                                </View>
                                <Text style={[styles.italic, { marginBottom: 3 }]}>{exp.role}</Text>
                                <View style={styles.bulletPoint}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.bulletText}>{exp.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Projects */}
                {data.projects.length > 0 && data.projects[0].name && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Projects</Text>
                        {data.projects.map((proj, i) => (
                            <View key={i} style={{ marginBottom: 8 }}>
                                <View style={styles.row}>
                                    <Text style={styles.bold}>{proj.name}</Text>
                                </View>
                                {proj.tech && (
                                    <Text style={[styles.italic, { fontSize: 10, color: '#444', marginBottom: 2 }]}>
                                        Tech Stack: {proj.tech}
                                    </Text>
                                )}
                                <View style={styles.bulletPoint}>
                                    <Text style={styles.bullet}>•</Text>
                                    <Text style={styles.bulletText}>{proj.description}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* Skills */}
                {data.skills.length > 0 && data.skills[0] && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Technical Skills</Text>
                        <View style={styles.skillsRow}>
                            <Text style={styles.text}>
                                {data.skills.join(', ')}
                            </Text>
                        </View>
                    </View>
                )}

                {/* Custom Sections */}
                {data.customSections?.map((section) => (
                    <View key={section.id} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <Text style={styles.text}>{section.content}</Text>
                    </View>
                ))}
            </Page>
        </Document>
    );
};

export default StandardTemplate;
