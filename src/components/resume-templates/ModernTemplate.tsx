import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register a sans-serif font for a modern look (using standard Helvetica for now, 
// but could be swapped for Lato or Open Sans if registered)
const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.4,
        color: '#333',
        flexDirection: 'row', // Main layout is a row
    },
    leftColumn: {
        width: '33%',
        paddingRight: 15,
        borderRightWidth: 1,
        borderRightColor: '#eee',
        height: '100%',
    },
    rightColumn: {
        width: '67%',
        paddingLeft: 15,
        height: '100%',
    },
    headerName: {
        fontSize: 22,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        color: '#000',
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 11,
        color: '#666',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionTitle: {
        fontSize: 12,
        fontFamily: 'Helvetica-Bold',
        textTransform: 'uppercase',
        color: '#222',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 2,
        marginBottom: 10,
        marginTop: 15,
        letterSpacing: 1,
    },
    sectionTitleFirst: {
        marginTop: 0,
    },
    itemTitle: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: '#000',
    },
    itemSubtitle: {
        fontSize: 10,
        fontFamily: 'Helvetica-Oblique', // Italic
        color: '#444',
        marginBottom: 2,
    },
    itemDate: {
        fontSize: 9,
        color: '#666',
        marginBottom: 4,
    },
    itemText: {
        fontSize: 10,
        marginBottom: 2,
        color: '#333',
    },
    skillCategory: {
        fontFamily: 'Helvetica-Bold',
        fontSize: 10,
        marginTop: 5,
        marginBottom: 2,
    },
    skillList: {
        fontSize: 10,
        color: '#444',
    },
    contactItem: {
        fontSize: 10,
        color: '#444',
        marginBottom: 3,
    },
    bulletPoint: {
        flexDirection: 'row',
        marginBottom: 2,
        paddingLeft: 5,
    },
    bullet: {
        width: 6,
        fontSize: 10,
        color: '#666',
    },
    bulletText: {
        flex: 1,
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

interface ModernTemplateProps {
    data: ResumeData;
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({ data }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* LEFT COLUMN - Education, Skills, Contact */}
                <View style={styles.leftColumn}>
                    {/* Contact (Top of Left Column for Deedy style usually, or Name could be top spanning) */}
                    <View style={{ marginBottom: 20 }}>
                        {/* Note: In some Deedy variants, Name is at the very top plain. 
                 Here we'll put contact info first in column if name is in right, 
                 OR we can put name in left. Let's put Name in Left for a strong sidebar look. */}
                        <Text style={styles.headerName}>{data.personal.name || 'YOUR NAME'}</Text>
                        <Text style={styles.headerTitle}> Resume </Text>

                        <Text style={styles.sectionTitle}>Contact</Text>
                        {data.personal.email && <Text style={styles.contactItem}>{data.personal.email}</Text>}
                        {data.personal.phone && <Text style={styles.contactItem}>{data.personal.phone}</Text>}
                        {data.personal.linkedin && <Text style={styles.contactItem}>{data.personal.linkedin}</Text>}
                        {data.personal.github && <Text style={styles.contactItem}>{data.personal.github}</Text>}
                    </View>

                    {/* Education */}
                    {data.education.length > 0 && (
                        <View>
                            <Text style={styles.sectionTitle}>Education</Text>
                            {data.education.map((edu, i) => (
                                <View key={i} style={{ marginBottom: 12 }}>
                                    <Text style={styles.itemTitle}>{edu.school}</Text>
                                    <Text style={styles.itemSubtitle}>{edu.degree}</Text>
                                    <Text style={styles.itemDate}>{edu.year}</Text>
                                    {edu.cgpa && <Text style={styles.itemText}>CGPA: {edu.cgpa}</Text>}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Skills */}
                    {data.skills.length > 0 && (
                        <View>
                            <Text style={styles.sectionTitle}>Skills</Text>
                            {/* Assuming single list for now, but styling as block */}
                            <Text style={styles.skillList}>
                                {data.skills.join(', ')}
                            </Text>
                        </View>
                    )}
                </View>

                {/* RIGHT COLUMN - Experience, Projects */}
                <View style={styles.rightColumn}>

                    {/* Experience */}
                    {data.experience.length > 0 && data.experience[0].company && (
                        <View>
                            <Text style={[styles.sectionTitle, styles.sectionTitleFirst]}>Experience</Text>
                            {data.experience.map((exp, i) => (
                                <View key={i} style={{ marginBottom: 15 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <Text style={styles.itemTitle}>{exp.company}</Text>
                                        <Text style={styles.itemDate}>{exp.duration}</Text>
                                    </View>
                                    <Text style={styles.itemSubtitle}>{exp.role}</Text>
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
                        <View>
                            <Text style={styles.sectionTitle}>Projects</Text>
                            {data.projects.map((proj, i) => (
                                <View key={i} style={{ marginBottom: 12 }}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                        <Text style={styles.itemTitle}>{proj.name}</Text>
                                    </View>
                                    {proj.tech && (
                                        <Text style={[styles.itemSubtitle, { color: '#555', fontSize: 9 }]}>{proj.tech}</Text>
                                    )}
                                    <View style={styles.bulletPoint}>
                                        <Text style={styles.bullet}>•</Text>
                                        <Text style={styles.bulletText}>{proj.description}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Custom Sections */}
                    {data.customSections?.map((section) => (
                        <View key={section.id}>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                            <Text style={styles.itemText}>{section.content}</Text>
                        </View>
                    ))}
                </View>

            </Page>
        </Document>
    );
};

export default ModernTemplate;
